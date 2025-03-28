import { TransitionPresets } from '@react-navigation/stack';
import { Animated } from 'react-native';

interface TransitionProps {
  current: {
    progress: Animated.AnimatedInterpolation<number>;
  };
  layouts: {
    screen: {
      width: number;
      height: number;
    };
  };
}

export const transitions = {
  // Default slide transition
  default: {
    ...TransitionPresets.SlideFromRightIOS,
    cardStyleInterpolator: ({ current, layouts }: TransitionProps) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    }),
  },

  // Fade transition
  fade: {
    ...TransitionPresets.FadeFromBottomAndroid,
    cardStyleInterpolator: ({ current }: TransitionProps) => ({
      cardStyle: {
        opacity: current.progress,
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    }),
  },

  // Modal transition
  modal: {
    ...TransitionPresets.ModalPresentationIOS,
    cardStyleInterpolator: ({ current, layouts }: TransitionProps) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    }),
  },

  // Scale transition
  scale: {
    cardStyleInterpolator: ({ current }: TransitionProps) => ({
      cardStyle: {
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    }),
  },
}; 