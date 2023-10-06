import React from "react"
import americanExpress from "../../../assets/images/cardLogos/AmEx/Amex_transparent_back.png"
import discover from "../../../assets/images/cardLogos/Discover/Discover.png"
import jcb from "../../../assets/images/cardLogos/JCB/JCB-transparent-bcak.png"
import maestro from "../../../assets/images/cardLogos/Maestro/ms_vrt_opt_pos_73_3x.png"
import masterCard from "../../../assets/images/cardLogos/MasterCard/mc_symbol_opt_73_3x.png"
import unionPay from "../../../assets/images/cardLogos/UnionPay/union_pay_transparent_background.png"
import visa from "../../../assets/images/cardLogos/Visa/Visa_Brandmark_Blue_RGB_2021.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

const CardLogo = ({divClass, imgClass, cardType}) => {

    const allCardLogo = {
        "American Express":americanExpress,
        "Discover":discover,
        "JCB":jcb,
        "Maestro":maestro,
        "Mastercard":masterCard,
        "UnionPay": unionPay,
        "Visa":visa
    }

    return (<>
        <div className={divClass}>
        {allCardLogo[cardType] ? 
                               <img src={allCardLogo[cardType]} className={imgClass} />
                               :
                                <FontAwesomeIcon icon={faCreditCard} className="business-plan-cc-icon" />
        }
        </div>
    </>)
}

export default CardLogo