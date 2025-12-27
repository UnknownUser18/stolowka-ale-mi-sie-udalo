import { Router } from 'express';
import declarationsRouter from './declarations';
import personsRouter from './persons';
import absencesRouter from './absences';
import guardiansRouter from './guardians';
import scansRouter from './scans';
import paymentsRouter from './payments';
import pricingRouter from './pricing';
import cardRouter from './cards';

const router = Router({
  caseSensitive : true,
  strict : true,
});

router.use('/declaration', declarationsRouter);
router.use('/person', personsRouter);
router.use('/absence', absencesRouter);
router.use('/guardian', guardiansRouter);
router.use('/scan', scansRouter);
router.use('/payment', paymentsRouter);
router.use('/pricing', pricingRouter);
router.use('/card', cardRouter);

export const isDniCode = (value : any) : boolean => {
  return typeof value === 'string' && value.length === 5 && /^[01]{5}$/.test(value);
}

export default router;