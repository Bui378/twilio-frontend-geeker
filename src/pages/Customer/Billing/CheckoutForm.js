import React, { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
export default function CheckoutForm() {
    // 1️⃣ Setup state to track client secret, errors and checkout status
    const [succeeded, setSucceeded] = useState(false);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [clientSecret, setClientSecret] = useState("");

    // 2️⃣ Store reference to Stripe
    const stripe = useStripe();
    const elements = useElements();
    useEffect(() => {
        // 3️⃣ Create PaymentIntent and fetch client secret as soon as the page loads
        window.fetch("/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
            }).then((res) => { 
                return res.json();
            }).then((data) => {
                setClientSecret(data.clientSecret);
            });
        }, []);
        const handleChange = async (event) => {
        // 4️⃣ Listen for changes in the CardElement and display any errors as the customer types their card details
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    };
    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setProcessing(true);
        // 5️⃣ Confirm Card Payment.
        const payload = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            },
        });
        if (payload.error) {
            setError(`Payment failed ${payload.error.message}`);
            setProcessing(false);
        } else {
            setError(null);
            setProcessing(false);
            setSucceeded(true);
        }
    };
    // 6️⃣ Construct UI.
    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <CardElement 
                id="card-element"
                options={{}} 
                onChange={handleChange}
            />
            <button disabled={processing || disabled || succeeded} id="submit">
                <span id="button-text">
                    {processing ? <div className="spinner" id="spinner"></div> : "Pay"}
                </span>
            </button>
            
            {error && (
                    <div className="card-error" role="alert">{error}</div>
                )
            }
            
            <p className={succeeded ? "result-message" : "result-message hidden"}>Payment succeeded!</p>
        </form>
    );
}