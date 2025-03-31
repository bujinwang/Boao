// Icon assets
export const icons = {
  home: require('./home.png'),
  profile: require('./profile.png'),
  settings: require('./settings.png'),
  search: require('./search.png'),
  close: require('./close.png'),
} as const;

export type IconAsset = keyof typeof icons; 