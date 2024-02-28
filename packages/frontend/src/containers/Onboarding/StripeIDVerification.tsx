import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../lib/contextLib"

export default function StripeIDVerification() {
    const { user } = useAppContext();
    const nav = useNavigate();

    if(!user.purchased) {
        // nav('/purchase');
    }

    return (
        <div className="StripeIDVerification">
            
        </div>
    )
}