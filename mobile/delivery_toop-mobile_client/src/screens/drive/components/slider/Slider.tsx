import React, { useEffect, useState, memo } from 'react';
import { Linking, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { SliderBox } from 'react-native-image-slider-box';

/** Styles */
import { Colors } from '../../../../styles';

const Slider = ({ images, sliders }: any) => {
  const [isRender, setIsRender] = useState(false);

  useEffect(() => {
    if (
      isRender === false &&
      images &&
      Array.isArray(images) &&
      images.length > 0 &&
      sliders &&
      Array.isArray(sliders) &&
      sliders.length > 0
    ) {
      setIsRender(true);
    }
  }, [isRender, images, sliders]);

  return (
    <>
      {isRender ? (
        <SliderBox
          ImageComponent={FastImage}
          images={images}
          sliderBoxHeight={110}
          dotColor={Colors.ALERT}
          inactiveDotColor={Colors.DARK_LIGHT}
          paginationBoxVerticalPadding={5}
          activeOpacity={0.9}
          autoplay
          circleLoop
          resizeMethod={'resize'}
          resizeMode={'stretch'}
          marginTop={10}
          width={'100%'}
          autoplayInterval={8000}
          onCurrentImagePressed={(index: number) => {
            const destinationurl = sliders[index]?.destinationurl || null;
            if (destinationurl) {
              Linking.openURL(destinationurl);
            }
          }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
        />
      ) : null}
    </>
  );
};

export default memo(Slider);
