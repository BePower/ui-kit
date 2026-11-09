import type { PictogramMap } from './pictogram-map.interface';

export const pictogramMap: PictogramMap = {
  'accesso-biometrico': () =>
    import('./pictograms/accesso-biometrico').then(
      ({ accessoBiometricoPictogram }) => accessoBiometricoPictogram,
    ),
  activity: () =>
    import('./pictograms/activity').then(({ activityPictogram }) => activityPictogram),
  'avvio-ricarica': () =>
    import('./pictograms/avvio-ricarica').then(
      ({ avvioRicaricaPictogram }) => avvioRicaricaPictogram,
    ),
  'battery-25': () =>
    import('./pictograms/battery-25').then(({ battery25Pictogram }) => battery25Pictogram),
  'battery-50': () =>
    import('./pictograms/battery-50').then(({ battery50Pictogram }) => battery50Pictogram),
  'battery-75': () =>
    import('./pictograms/battery-75').then(({ battery75Pictogram }) => battery75Pictogram),
  'battery-over-75': () =>
    import('./pictograms/battery-over-75').then(
      ({ batteryOver75Pictogram }) => batteryOver75Pictogram,
    ),
  'e-truck': () => import('./pictograms/e-truck').then(({ eTruckPictogram }) => eTruckPictogram),
  'email-verificata': () =>
    import('./pictograms/email-verificata').then(
      ({ emailVerificataPictogram }) => emailVerificataPictogram,
    ),
  favoriti: () =>
    import('./pictograms/favoriti').then(({ favoritiPictogram }) => favoritiPictogram),
  gps: () => import('./pictograms/gps').then(({ gpsPictogram }) => gpsPictogram),
  info: () => import('./pictograms/info').then(({ infoPictogram }) => infoPictogram),
  'invita-amico': () =>
    import('./pictograms/invita-amico').then(({ invitaAmicoPictogram }) => invitaAmicoPictogram),
  loyalty: () => import('./pictograms/loyalty').then(({ loyaltyPictogram }) => loyaltyPictogram),
  'metodo-pagamento': () =>
    import('./pictograms/metodo-pagamento').then(
      ({ metodoPagamentoPictogram }) => metodoPagamentoPictogram,
    ),
  negative: () =>
    import('./pictograms/negative').then(({ negativePictogram }) => negativePictogram),
  'nessuna-ricarica': () =>
    import('./pictograms/nessuna-ricarica').then(
      ({ nessunaRicaricaPictogram }) => nessunaRicaricaPictogram,
    ),
  notifica: () =>
    import('./pictograms/notifica').then(({ notificaPictogram }) => notificaPictogram),
  positive: () =>
    import('./pictograms/positive').then(({ positivePictogram }) => positivePictogram),
  'profilo-aggiornato': () =>
    import('./pictograms/profilo-aggiornato').then(
      ({ profiloAggiornatoPictogram }) => profiloAggiornatoPictogram,
    ),
  'riprendi-registrazione': () =>
    import('./pictograms/riprendi-registrazione').then(
      ({ riprendiRegistrazionePictogram }) => riprendiRegistrazionePictogram,
    ),
  wallet: () => import('./pictograms/wallet').then(({ walletPictogram }) => walletPictogram),
};
