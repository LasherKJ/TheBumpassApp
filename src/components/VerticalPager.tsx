import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  ScrollView,
  Dimensions,
  StyleSheet,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface VerticalPagerRef {
  scrollToPage: (index: number) => void;
}

interface VerticalPagerProps {
  children: React.ReactNode[];
  onPageChanged?: (index: number) => void;
  scrollEnabled?: boolean;
}

export const VerticalPager = forwardRef<VerticalPagerRef, VerticalPagerProps>(
  ({ children, onPageChanged, scrollEnabled = false }, ref) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const currentPage = useRef(0);

    const scrollToPage = useCallback((index: number) => {
      scrollViewRef.current?.scrollTo({
        y: index * SCREEN_HEIGHT,
        animated: true,
      });
    }, []);

    useImperativeHandle(ref, () => ({ scrollToPage }), [scrollToPage]);

    const handleMomentumEnd = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const pageIndex = Math.round(
          event.nativeEvent.contentOffset.y / SCREEN_HEIGHT
        );
        if (pageIndex !== currentPage.current) {
          currentPage.current = pageIndex;
          onPageChanged?.(pageIndex);
        }
      },
      [onPageChanged]
    );

    return (
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        bounces={false}
        onMomentumScrollEnd={handleMomentumEnd}
        decelerationRate="fast"
        scrollEventThrottle={16}
      >
        {children.map((child, index) => (
          <View key={index} style={styles.page}>
            {child}
          </View>
        ))}
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    height: SCREEN_HEIGHT,
    width: '100%',
  },
});
