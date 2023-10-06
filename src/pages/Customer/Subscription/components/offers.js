import React, { useState, useEffect} from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import * as PromoApi from '../../../../api/promo.api';
import "react-widgets/styles.css";
import Combobox from "react-widgets/Combobox";

const Offers =  ({ productName ,productId,productPrice,user,promoId,setPromoId,couponId,setCouponId,promoAppliedFor, setPromoAppliedFor, liveUser}) => {
    console.log("productName given",productName)
    const [offerCode, setOfferCode] = useState("")
    const [promoCodes, setPromoCodes] = useState([])
    const [promoData, setPromoData] =useState([]);
    const [validateMessage, setvalidateMessage] = useState("")
    const [inValidMessage, setInValidMessage] = useState("")
    const [isValidate, setIsValidate] = useState(false)
    const [discountedPrice, setDiscountedPrice] = useState(0)

    useEffect(()=>{
        (async()=>{
            if(user && user?.customer && user?.customer?.id){
                let promolist = await PromoApi.retrieveCustomerPromoCodes({"customer_id":user.customer.id,"redeemed":true})
                setPromoData(promolist)
                console.log("promolist:::::",promolist)
                if(promolist.length>0){
                    let data=await promolist.map(item=>item.promo_code)
                    setPromoCodes(data)
                }
            }
        })()        
    },[user])

    const handleTypePromoCode = async(e, name, productId)=>{
        setvalidateMessage("")
        setInValidMessage("")
        setPromoId("")
        setCouponId("")
        if(e !== null && e !== undefined && e !== '' ){
            setPromoAppliedFor(name)
            setOfferCode(e)
        }else{
            setOfferCode(e)
            setPromoAppliedFor('')
        }
    }

    const handleCouponCode = async()=>{
        console.log("couponId:::::>>>",offerCode)
        let coupon;
        let offerCouponCode = offerCode.toLowerCase().trim()
        let promoCodeData = promoData.find(o => o.promo_code === offerCouponCode);
        if(promoCodeData){
            setPromoId(promoCodeData.promo_id)
            setvalidateMessage("Promo Applied Successfully")
            setIsValidate(true)
        }else{  
            coupon = await  PromoApi.validateCoupon({"couponCode":offerCouponCode,"customerId":user.customer.id,"productId":productId,"liveUser":liveUser})
            if(coupon.isValid){
                setCouponId(offerCouponCode)
                setvalidateMessage(coupon.message) 
                setIsValidate(true)
                setDiscountedPrice(coupon.discountedPrice)
            }else{
                setInValidMessage(coupon.message)  
                offerCouponCode=''
            }
        }
    }

    const calculatePar= (price)=>{
        let finalprice = parseFloat(price)-(0.05 * parseFloat(price))
        return '$'+finalprice.toFixed(2);
    }

    return(
        <React.Fragment key="subscription">
            <Col md ={12}>
                <p className='flat-p'> Get flat 5% off on buy new subscription using promocode</p>
            </Col>
            {/* <Row className='col-12 px-2'>
                <Col id={productName} className="mb-3" lg={8} md={8}>
                    <Combobox
                        className={"subscription-dropdown"}
                        placeholder="Select Promocode"
                        value={promoAppliedFor === productName ? offerCode : ""}
                        name={productName}
                        data={promoCodes}
                        hideEmptyPopup={true}
                        hideCaret={true}
                        onChange={(e) => handleTypePromoCode(e, productName, productId)}>
                    </Combobox>

                </Col>

                <Col lg={4} md={4}>
                    <Button className="btn app-btn mb-1"  style={{minWidth:"unset",lineHeight: 2.5}}  disabled={promoAppliedFor === productName ? false : true} onClick={handleCouponCode}>Apply</Button>
                </Col>
            </Row> */}
            
            {promoAppliedFor === productName &&
                    <Col md ={12} className="ml-2" style={{color: couponId || promoId ? "green" : "red", textAlign:"left"}}>
                        {validateMessage!=="" ?  validateMessage : inValidMessage}
                    </Col>
            }

            {promoAppliedFor === productName && (couponId || promoId) && isValidate &&
                <React.Fragment key="promo">
                    <Row md={12}> 
                        <Col 
                            md ={12} 
                            className="o-cost" 
                            style={divStyle}
                        >
                            <span>Subscription cost:  </span>
                            <span style={{textDecoration: "line-through"}}>
                                {productPrice.currency === 'usd' ? '$' : productPrice.currency}{(productPrice.unit_amount/100)}
                            </span>
                        </Col>
                        <Col 
                            md ={12} 
                            className="n-cost mb-2" 
                            style={divStyle}>
                                <span>You pay:  </span>
                                <span style={{color: "green"}}>{couponId ? discountedPrice : promoId ? calculatePar((productPrice.unit_amount/100),) : " " }</span>
                        </Col>
                    </Row>
                </React.Fragment>
            }
               
            
       
        </React.Fragment>
    )
}

const divStyle = {
    fontSize: "15px",
    marginLeft: "15px",
    fontSize: "15px",
  };
export default Offers;
    