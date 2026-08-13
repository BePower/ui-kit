import { IconMap } from './icon-map.interface';

export const iconMap: IconMap = {
  'apple-logo': {
    fill: () => import('./icons/apple-logo').then(({ appleLogoFill }) => appleLogoFill),
    'no-fill': () => import('./icons/apple-logo').then(({ appleLogoNoFill }) => appleLogoNoFill),
  },
  arrow: {
    fill: () => import('./icons/arrow').then(({ arrowFill }) => arrowFill),
    'no-fill': () => import('./icons/arrow').then(({ arrowNoFill }) => arrowNoFill),
  },
  'arrow-left': {
    'no-fill': () => import('./icons/arrow-left').then(({ arrowLeftNoFill }) => arrowLeftNoFill),
  },
  'arrow-right': {
    'no-fill': () => import('./icons/arrow-right').then(({ arrowRightNoFill }) => arrowRightNoFill),
  },
  bank: {
    fill: () => import('./icons/bank').then(({ bankFill }) => bankFill),
    'no-fill': () => import('./icons/bank').then(({ bankNoFill }) => bankNoFill),
  },
  building: {
    fill: () => import('./icons/building').then(({ buildingFill }) => buildingFill),
    'no-fill': () => import('./icons/building').then(({ buildingNoFill }) => buildingNoFill),
  },
  camera: {
    fill: () => import('./icons/camera').then(({ cameraFill }) => cameraFill),
    'no-fill': () => import('./icons/camera').then(({ cameraNoFill }) => cameraNoFill),
  },
  car: {
    fill: () => import('./icons/car').then(({ carFill }) => carFill),
    'no-fill': () => import('./icons/car').then(({ carNoFill }) => carNoFill),
  },
  card: {
    fill: () => import('./icons/card').then(({ cardFill }) => cardFill),
    'no-fill': () => import('./icons/card').then(({ cardNoFill }) => cardNoFill),
  },
  change: {
    'no-fill': () => import('./icons/change').then(({ changeNoFill }) => changeNoFill),
  },
  check: {
    'no-fill': () => import('./icons/check').then(({ checkNoFill }) => checkNoFill),
  },
  clock: {
    'no-fill': () => import('./icons/clock').then(({ clockNoFill }) => clockNoFill),
  },
  close: {
    'no-fill': () => import('./icons/close').then(({ closeNoFill }) => closeNoFill),
  },
  condivisione: {
    'no-fill': () =>
      import('./icons/condivisione').then(({ condivisioneNoFill }) => condivisioneNoFill),
  },
  counter: {
    fill: () => import('./icons/counter').then(({ counterFill }) => counterFill),
    'no-fill': () => import('./icons/counter').then(({ counterNoFill }) => counterNoFill),
  },
  cta: {
    'no-fill': () => import('./icons/cta').then(({ ctaNoFill }) => ctaNoFill),
  },
  doc: {
    fill: () => import('./icons/doc').then(({ docFill }) => docFill),
    'no-fill': () => import('./icons/doc').then(({ docNoFill }) => docNoFill),
  },
  dropdown: {
    'no-fill': () => import('./icons/dropdown').then(({ dropdownNoFill }) => dropdownNoFill),
  },
  'dropdown-left': {
    'no-fill': () =>
      import('./icons/dropdown-left').then(({ dropdownLeftNoFill }) => dropdownLeftNoFill),
  },
  'dropdown-right': {
    'no-fill': () =>
      import('./icons/dropdown-right').then(({ dropdownRightNoFill }) => dropdownRightNoFill),
  },
  'dropdown-up': {
    'no-fill': () => import('./icons/dropdown-up').then(({ dropdownUpNoFill }) => dropdownUpNoFill),
  },
  euro: {
    'no-fill': () => import('./icons/euro').then(({ euroNoFill }) => euroNoFill),
  },
  eye: {
    fill: () => import('./icons/eye').then(({ eyeFill }) => eyeFill),
    'no-fill': () => import('./icons/eye').then(({ eyeNoFill }) => eyeNoFill),
  },
  'eye-close': {
    'no-fill': () => import('./icons/eye-close').then(({ eyeCloseNoFill }) => eyeCloseNoFill),
  },
  'facebook-logo': {
    fill: () => import('./icons/facebook-logo').then(({ facebookLogoFill }) => facebookLogoFill),
    'no-fill': () =>
      import('./icons/facebook-logo').then(({ facebookLogoNoFill }) => facebookLogoNoFill),
  },
  fulmine: {
    fill: () => import('./icons/fulmine').then(({ fulmineFill }) => fulmineFill),
    'no-fill': () => import('./icons/fulmine').then(({ fulmineNoFill }) => fulmineNoFill),
  },
  gift: {
    'no-fill': () => import('./icons/gift').then(({ giftNoFill }) => giftNoFill),
  },
  'google-logo': {
    'no-fill': () => import('./icons/google-logo').then(({ googleLogoNoFill }) => googleLogoNoFill),
  },
  graph: {
    'no-fill': () => import('./icons/graph').then(({ graphNoFill }) => graphNoFill),
  },
  heart: {
    fill: () => import('./icons/heart').then(({ heartFill }) => heartFill),
    'no-fill': () => import('./icons/heart').then(({ heartNoFill }) => heartNoFill),
  },
  hourglass: {
    fill: () => import('./icons/hourglass').then(({ hourglassFill }) => hourglassFill),
    'no-fill': () => import('./icons/hourglass').then(({ hourglassNoFill }) => hourglassNoFill),
  },
  info: {
    'no-fill': () => import('./icons/info').then(({ infoNoFill }) => infoNoFill),
  },
  lens: {
    'no-fill': () => import('./icons/lens').then(({ lensNoFill }) => lensNoFill),
  },
  lines: {
    'no-fill': () => import('./icons/lines').then(({ linesNoFill }) => linesNoFill),
  },
  menu: {
    'no-fill': () => import('./icons/menu').then(({ menuNoFill }) => menuNoFill),
  },
  notification: {
    fill: () => import('./icons/notification').then(({ notificationFill }) => notificationFill),
    'no-fill': () =>
      import('./icons/notification').then(({ notificationNoFill }) => notificationNoFill),
  },
  pin: {
    fill: () => import('./icons/pin').then(({ pinFill }) => pinFill),
    'no-fill': () => import('./icons/pin').then(({ pinNoFill }) => pinNoFill),
  },
  plate: {
    fill: () => import('./icons/plate').then(({ plateFill }) => plateFill),
    'no-fill': () => import('./icons/plate').then(({ plateNoFill }) => plateNoFill),
  },
  plus: {
    'no-fill': () => import('./icons/plus').then(({ plusNoFill }) => plusNoFill),
  },
  posizione: {
    fill: () => import('./icons/posizione').then(({ posizioneFill }) => posizioneFill),
    'no-fill': () => import('./icons/posizione').then(({ posizioneNoFill }) => posizioneNoFill),
  },
  profile: {
    fill: () => import('./icons/profile').then(({ profileFill }) => profileFill),
    'no-fill': () => import('./icons/profile').then(({ profileNoFill }) => profileNoFill),
  },
  route: {
    fill: () => import('./icons/route').then(({ routeFill }) => routeFill),
    'no-fill': () => import('./icons/route').then(({ routeNoFill }) => routeNoFill),
  },
  setting: {
    fill: () => import('./icons/setting').then(({ settingFill }) => settingFill),
    'no-fill': () => import('./icons/setting').then(({ settingNoFill }) => settingNoFill),
  },
  share: {
    'no-fill': () => import('./icons/share').then(({ shareNoFill }) => shareNoFill),
  },
  star: {
    fill: () => import('./icons/star').then(({ starFill }) => starFill),
    'no-fill': () => import('./icons/star').then(({ starNoFill }) => starNoFill),
  },
  supporto: {
    fill: () => import('./icons/supporto').then(({ supportoFill }) => supportoFill),
    'no-fill': () => import('./icons/supporto').then(({ supportoNoFill }) => supportoNoFill),
  },
  trash: {
    'no-fill': () => import('./icons/trash').then(({ trashNoFill }) => trashNoFill),
  },
  valigia: {
    'no-fill': () => import('./icons/valigia').then(({ valigiaNoFill }) => valigiaNoFill),
  },
  wallet: {
    fill: () => import('./icons/wallet').then(({ walletFill }) => walletFill),
    'no-fill': () => import('./icons/wallet').then(({ walletNoFill }) => walletNoFill),
  },
  warning: {
    fill: () => import('./icons/warning').then(({ warningFill }) => warningFill),
    'no-fill': () => import('./icons/warning').then(({ warningNoFill }) => warningNoFill),
  },
};
