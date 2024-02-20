import { View as RNView, ViewProps as RNViewProps } from 'react-native';
import { useTheme } from 'react-native-paper';

type ViewProps = RNViewProps & {
  stretch?: boolean;
};

export function View(props: ViewProps) {
  const { colors } = useTheme();
  const style = [
    {
      flex: props.stretch ? 1 : 0,
      backgroundColor: colors.background,
    },
    props.style
  ]

  return (
    <RNView {...props} style={style} />
  );
}
