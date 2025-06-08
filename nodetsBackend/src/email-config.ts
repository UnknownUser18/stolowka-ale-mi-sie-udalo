import {EmailKalendarzData, EmailPersonalData, Person, RequestPayload, ZstiEmailData} from "./types";
import {createTransport, Transporter} from "nodemailer";
import {env} from "./config";

export function updateZstiEmailKalendarz(id: number, kalendarz: EmailKalendarzData){
    if(!ZstiData.has(id)) return;
    ZstiData.get(id)!.kalendarz = kalendarz;
}

export function updateZstiEmailPersonalData(id: number, dane: EmailPersonalData){
    if(!ZstiData.has(id)) return;
    ZstiData.get(id)!.dane = dane;
}

export function updateZstiData(category: string, operation: string, params: RequestPayload){
    if(category === 'student'){
        if(operation === 'add'){
            if(!ZstiData.has(params.params.id))
                ZstiData.set(params.params.id, initZstiEmailData())
        } else if(operation === 'update'){
            if(!ZstiData.has(params.params.id))
                ZstiData.set(params.params.id, initZstiEmailData())
            updateZstiEmailPersonalData(params.params.id, {
                imie: params.params.imie,
                nazwisko: params.params.nazwisko,
                klasa: params.params.klasa,
                uczeszcza: params.params.uczeszcza,
                miasto: params.params.miasto,
                nr_kierunkowy: params.params.nr_kierunkowy,
                telefon: params.params.telefon,
                email: params.params.email,
                imie_opiekuna: params.params.imie_opiekuna,
                nazwisko_opiekuna: params.params.nazwisko_opiekuna
            })
        }
    }
    else if (category === 'absence'){
        if(operation !== 'add' && operation !== 'delete') return;
        if(!ZstiData.has(params.params.osoby_zsti_id))
            ZstiData.set(params.params.osoby_zsti_id, initZstiEmailData())
        let kalendarz = ZstiData.get(params.params.osoby_zsti_id)!.kalendarz;
        console.log(kalendarz)
        if(operation === 'add'){
            if(kalendarz.usunieteNieobecnosci.includes(params.params.dzien_wypisania))
                kalendarz.usunieteNieobecnosci.splice(kalendarz.usunieteNieobecnosci.indexOf(params.params.dzien_wypisania),1)
            else if(!kalendarz.dodaneNieobecnosci.includes(params.params.dzien_wypisania))
                kalendarz.dodaneNieobecnosci.push(params.params.dzien_wypisania)
        } else if (operation === 'delete'){
            if(kalendarz.dodaneNieobecnosci.includes(params.params.dzien_wypisania))
                kalendarz.dodaneNieobecnosci.splice(kalendarz.dodaneNieobecnosci.indexOf(params.params.dzien_wypisania),1)
            else if(!kalendarz.usunieteNieobecnosci.includes(params.params.dzien_wypisania))
                kalendarz.usunieteNieobecnosci.push(params.params.dzien_wypisania)
        }
        console.log(kalendarz)
        updateZstiEmailKalendarz(params.params.osoby_zsti_id, kalendarz)
    }
}

/**
 * Inicjalizacja serwisu obsługującego maile
 * */
export const transporter: Transporter = createTransport({
    service: 'gmail',
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export function sendEmail(receiver: string, subject: string, html: string) {
    try{
        transporter.sendMail({
            from: env.SMTP_USER,
            to: receiver,
            subject: subject,
            html: html
        }).then(r => console.log(r))
    } catch (err: any){
        throw new Error(err);
    }
}

// export function testTransporter(){
//     sendEmail('xxxxxxszymi@gmail.com', 'Test Email', 'Hello World!');
// }

export const ZstiData: Map<number, ZstiEmailData> = new Map<number, ZstiEmailData>();

export const nullPersonalData: EmailPersonalData = {
    imie: '',
    nazwisko: '',
    klasa: '',
    uczeszcza: false,
    miasto: false,
    imie_opiekuna: undefined,
    nazwisko_opiekuna: undefined,
    nr_kierunkowy: '',
    telefon: '',
    email: ''
};

export function initZstiEmailData(kalendarz: EmailKalendarzData = {usunieteNieobecnosci: [], dodaneNieobecnosci: []}, dane: EmailPersonalData = nullPersonalData) {
    return {
        kalendarz,
        dane
    } as ZstiEmailData;
}

export function sendEmailAbtKalendarz(studentData: ZstiEmailData, studentDetails: Person){
    console.log(studentData, studentDetails)
    sendEmail(studentDetails.email, "Zmiana Przyszłych Nieobecności Na Obiedzie", generateEmailTemplate(studentData.kalendarz, studentDetails))
    sendEmail('xxxxxxszymi@gmail.com', "Zmiana Przyszłych Nieobecności Na Obiedzie - Backup", generateEmailTemplate(studentData.kalendarz, studentDetails))
}

export function sendEmailAbtPersonalData(studentData: ZstiEmailData, studentDetails: Person){
    console.log(studentData, studentDetails)
    const fields: (keyof EmailPersonalData)[] = [
        'imie', 'nazwisko', 'klasa', 'uczeszcza', 'miasto',
        'imie_opiekuna', 'nazwisko_opiekuna', 'nr_kierunkowy', 'telefon', 'email'
    ];
    fields.forEach(field => {
        if((studentData.dane as EmailPersonalData)[field] !== (studentData.dane as EmailPersonalData)[field] ){
            fields.splice(fields.indexOf(field), 1);
        }
    })
    let datachange: DataChange = {
        newData: studentData.dane as Person,
        changedFields: fields
    }
    sendEmail(studentDetails.email, "Zmiana Danych Osobowych", generateDataChangeEmail(datachange))
    sendEmail('xxxxxxszymi@gmail.com', "Zmiana Danych Osobowych - Backup", generateDataChangeEmail(datachange))
}

type ChangeType = 'added' | 'removed';

const generateStyles = (): string => `
  <style>
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f7f7f7;
      padding: 20px 0;
      font-family: Arial, sans-serif;
    }
    .main-table {
      max-width: 600px;
      margin: 0 auto;
      border-collapse: collapse;
      background: white;
    }
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 25px;
      text-align: center;
    }
    .content {
      padding: 30px;
      line-height: 1.6;
      color: #333333;
    }
    .changes-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0 30px;
    }
    .changes-table th {
      background-color: #ecf0f1;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    .changes-table td {
      padding: 12px;
      border-bottom: 1px solid #ecf0f1;
    }
    .added {
      color: #27ae60;
      font-weight: bold;
    }
    .removed {
      color: #e74c3c;
      font-weight: bold;
    }
    .section-title {
      font-size: 18px;
      margin-bottom: 10px;
      font-weight: bold;
      color: #2c3e50;
    }
    .footer {
      background-color: #ecf0f1;
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #7f8c8d;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white !important;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 15px 0;
    }
    @media screen and (max-width: 600px) {
      .content {
        padding: 20px;
      }
    }
  </style>
`;

const generateChangeRow = (change: string, type: ChangeType): string => `
  <tr>
    <td>${change}</td>
    <td>
      <span class="${type}">
        ${type === 'added' ? 'Dodano' : 'Odjęto'}
      </span>
    </td>
  </tr>
`;

const generateChangesTable = (changes: string[], type: ChangeType): string => {
    if (changes.length === 0) {
//         return `
// <p class="no-changes">Brak ${type === 'added' ? 'dodanych' : 'odjętych'} zmian</p>
// `;
        return ``;
    }

    return `
    <div class="section-title">${type === 'added' ? 'Zgłoszone Nieobecności' : 'Odwołane Nieobecności'}</div>
    <table class="changes-table">
      <tr>
        <th>Data obiadu</th>
        <th>Status</th>
      </tr>
      ${changes.map(change => generateChangeRow(change, type)).join('')}
    </table>
  `;
};

const generateEmailTemplate = (data: EmailKalendarzData, details: Person): string => {
    const addedTable = generateChangesTable(data.dodaneNieobecnosci, 'added');
    const removedTable = generateChangesTable(data.usunieteNieobecnosci, 'removed');
    return `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zmiany w obecności na obiadach</title>
      ${generateStyles()}
    </head>
    <body>
      <table class="wrapper">
        <tr>
          <td>
            <table class="main-table">
              <tr>
                <td class="header">
                  <h1>Zmiany w obecności na obiadach</h1>
                </td>
              </tr>
              
              <tr>
                <td class="content">
                  <p>Dzień dobry,</p>
                  <p>Informujemy o aktualizacji zgłaszanych nieobecności na obiadach dla ${details.imie} ${details.nazwisko}:</p>
                  
                  ${addedTable}
                  ${removedTable}
                  
                  <p>Z poważaniem,<br>Zespół Stołówki</p>
                </td>
              </tr>
              
              <tr>
                <td class="footer">
                  <p>Stołówka. Wszystkie prawa zastrzeżone.</p>
                  <p>Wiadomość wygenerowana automatycznie, prosimy na nią nie odpowiadać.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

interface DataChange {
    newData: Person;
    changedFields: (keyof Person)[];
}

const generateStylesPersonal = (): string => `
  <style>
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f7f7f7;
      padding: 20px 0;
      font-family: Arial, sans-serif;
    }
    .main-table {
      max-width: 600px;
      margin: 0 auto;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #2c3e50;
      color: white;
      padding: 25px;
      text-align: center;
    }
    .content {
      padding: 30px;
      line-height: 1.6;
      color: #333333;
    }
    .changes-table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
    }
    .changes-table th {
      background-color: #3498db;
      color: white;
      padding: 14px;
      text-align: left;
      font-weight: bold;
    }
    .changes-table td {
      padding: 14px;
      border-bottom: 1px solid #ecf0f1;
    }
    .changed-field {
      position: relative;
      padding-left: 20px;
    }
    .changed-field::before {
      content: "";
      position: absolute;
      left: 5px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background-color: #f39c12;
      border-radius: 50%;
    }
    .footer {
      background-color: #ecf0f1;
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #7f8c8d;
    }
    .section-title {
      font-size: 18px;
      margin: 25px 0 15px;
      font-weight: bold;
      color: #2c3e50;
      padding-bottom: 8px;
      border-bottom: 2px solid #3498db;
    }
    .change-indicator {
      display: inline-block;
      background-color: #fef5e7;
      color: #e67e22;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: 10px;
      font-weight: normal;
    }
    @media screen and (max-width: 650px) {
      .content {
        padding: 20px;
      }
      .changes-table {
        font-size: 14px;
      }
    }
  </style>
`;

const formatBoolean = (value: boolean): string => value ? 'Tak' : 'Nie';

// const formatPhone = (prefix: string, number: string): string => {
//     return prefix && number ? `${prefix} ${number}` : 'Brak danych';
// };

const getFieldLabel = (field: keyof Person, isChanged: boolean): string => {
    const labels: Record<keyof Person, string> = {
        imie: 'Imię',
        nazwisko: 'Nazwisko',
        klasa: 'Klasa',
        uczeszcza: 'Uczęszcza na obiady',
        miasto: 'Dofinansowanie',
        imie_opiekuna: 'Imię rodzica/opiekuna',
        nazwisko_opiekuna: 'Nazwisko rodzica/opiekuna',
        nr_kierunkowy: 'Nr kierunkowy',
        telefon: 'Telefon',
        email: 'Email',
        id: '',
        typ_osoby_id: ''
    };

    const label = labels[field];
    return isChanged
        ? `<span class="changed-field">${label}</span>`
        : label;
};

const formatFieldValue = (field: keyof Person, value: any): string => {
    if (field === 'uczeszcza' || field === 'miasto') {
        return formatBoolean(value);
    }

    if (field === 'telefon' || field === 'nr_kierunkowy') {
        return value || 'Brak danych';
    }

    return value || 'Nie podano';
};

const generateDataRow = (
    field: keyof Person,
    value: string | number | boolean,
    isChanged: boolean
): string => {
    const formattedValue = formatFieldValue(field, value);

    return `
    <tr>
      <td>${getFieldLabel(field, isChanged)} 
 ${isChanged && false ? '<span class="change-indicator">zmienione</span>' : ''}
</td>
      <td>${formattedValue}</td>
    </tr>
  `;
};

const generateChangesTablePersonal = (data: DataChange): string => {
    const fields: (keyof Person)[] = [
        'imie', 'nazwisko', 'klasa', 'uczeszcza', 'miasto',
        'imie_opiekuna', 'nazwisko_opiekuna', 'nr_kierunkowy', 'telefon', 'email'
    ];

    const rows = fields.map(field =>
        generateDataRow(
            field,
            data.newData[field],
            data.changedFields.includes(field)
        )).join('');

    return `
    <table class="changes-table">
      <tr>
        <th>Pole</th>
        <th>Wartość</th>
      </tr>
      ${rows}
    </table>
  `;
};

const generateDataChangeEmail = (data: DataChange): string => {
    const changesTable = generateChangesTablePersonal(data);

    return `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aktualizacja danych</title>
      ${generateStylesPersonal()}
    </head>
    <body>
      <table class="wrapper">
        <tr>
          <td>
            <table class="main-table">
              <tr>
                <td class="header">
                  <h1>Aktualizacja danych</h1>
                </td>
              </tr>

              <tr>
                <td class="content">
                  <p>Dzień dobry,</p>
                  <p>Twoje dane w systemie zostały zaktualizowane. Poniżej znajdują się aktualne informacje:</p>
                  
                  <div class="section-title">Aktualne dane:</div>
                  ${changesTable}
                  
                  <p>Z poważaniem,<br>Zespół Stołówki</p>
                </td>
              </tr>
              
              <tr>
                <td class="footer">
                  <p>Stołówka. Wszystkie prawa zastrzeżone.</p>
                  <p>Wiadomość wygenerowana automatycznie, prosimy na nią nie odpowiadać.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};