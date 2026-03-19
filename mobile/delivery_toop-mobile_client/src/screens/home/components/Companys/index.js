import React from 'react';

// import BuyAgain from './ShowCases/BuyAgain';
import Coupon from './ShowCases/Coupon';
import IndicatedForYou from './ShowCases/IndicatedForYou';
import Promotion from '../Promotion';

const Companys = ({category}) => {
  return (
    <>
      {category === 'delivery' ? (
        <>
          <Coupon />
          <Promotion />
        </>
      ) : null}
      {/* <BuyAgain /> */}
      <IndicatedForYou hr={false} category={category} />
    </>
  );
};

export default Companys;
