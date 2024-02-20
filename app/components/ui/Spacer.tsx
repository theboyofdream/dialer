import React from 'react';
import {View as RNView} from 'react-native';

type TSpacer = {
  horizontal?: boolean;
  size: number;
  stretch?: boolean;
};

export function Spacer({horizontal = false, size, stretch}: TSpacer) {
  return (
    <RNView
      style={{
        width: horizontal ? size : 'auto',
        height: !horizontal ? size : 'auto',
        flex: stretch ? 1 : 0,
      }}
    />
  );
}
