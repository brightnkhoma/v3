import { PaychanguCheckout } from "./payChangu";
import {v4} from 'uuid'

export interface PaymentDetails{
    amount : number;
    customer : Customer;
    txId : string

}

export interface Customer {
    email : string;
    first_name : string;
    last_name : string
}

export function makePayment(paymentDetails : PaymentDetails){
      const {amount,customer} = paymentDetails
      PaychanguCheckout({
        "public_key": "pub-test-aOOdXB7gMP1pkUDCPvSBYtrKkiWoEhUD",
        "tx_ref": paymentDetails.txId,
        "amount": amount,
        "currency": "MWK",
        "callback_url": "https://v3-sepia-zeta.vercel.app/",
        "return_url": "https://v3-sepia-zeta.vercel.app/",
        "customer":customer,
        "customization": {
          "title": "Continue with Payment",
          "description": "Select your payment option.",
        },
        "meta": {
          "uuid": "uuid",
          "response": "Response"
        }
      });
    }