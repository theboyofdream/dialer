import {useMemo} from 'react';
import {TextStyle, View, ViewStyle} from 'react-native';
import {Text} from 'react-native-paper';

// https://texteditor.com/text-faces/
const EMOTES = [
  '٩◔̯◔۶',
  '≧☉_☉≦',
  '°Д°',
  '¬_¬',
  '◔̯◔',
  'ಠ_ಥ',
  '~(˘▾˘~)',
  'ヾ(⌐■_■)ノ♪',
  'へ[ •́ ‸ •̀ ]ʋ',
  'ゞ◎Д◎ヾ',
  'ミ●﹏☉ミ',
  '▼・ᴥ・▼',
  'ᶘ ◕ᴥ◕ᶅ',
];

type EmptyStateProps = {
  hint?: string;
  fill?: boolean;
};

export function EmptyState(props: EmptyStateProps) {
  const emote = useMemo(function getRandomEmote() {
    return EMOTES[Math.floor(Math.random() * EMOTES.length)];
  }, []);

  return (
    <View style={[$container, props.fill && $fill]}>
      <Text variant="displayMedium" style={$emote} children={emote} />
      <Text variant="bodyLarge" children={props.hint} />
    </View>
  );
}

const $container: ViewStyle = {
  justifyContent: 'center',
  alignItems: 'center',
};
const $fill: ViewStyle = {
  flex: 1,
  flexGrow: 1,
};
const $emote: TextStyle = {
  margin: 18,
};
