import React, { useState, useEffect } from "react";
import { createStripeCheckoutSession } from "../../lib/stripeLib";

const ProductDisplay: React.FC = ({}) => (
  <div>
    <div className="product">
      <img
        src="https://i.imgur.com/EHyR2nP.png"
        alt="The cover of Stubborn Attachments"
      />
      <div className="description">
      <h3>Stubborn Attachments</h3>
      <h5>$20.00</h5>
      </div>
    </div>
    <form onSubmit={handleSubmit} method="POST">
      <button type="submit">
        Checkout
      </button>
    </form>
  </div>
);

// const Message: React.FC({message} : string) => (
//   <div>
//     <p>{message}</p>
//   </div>
// );

// const Message = ({ message }) => (
//     <section>
//       <p>{message}</p>
//     </section>
//   );

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createStripeCheckoutSession("tenant");
    console.log(result);
    const sessionUrl = result.sessionUrl;
    window.location.href = sessionUrl;
}

export default function StripePurchase() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, []);

  return (
    <div className="StripePurchase">
        {message === "" && <ProductDisplay />}
        {message != "" && <p>{message}</p>}
    </div>
  );
  
}