import { useEffect } from "react";
import { useAppContext } from "../lib/contextLib"
import { getTenantProfile } from "../lib/userLib";

export default function TenantProfile() {
    const { user } = useAppContext();
    
    async function onLoad() {
        const userProfile = await getTenantProfile(user);
        console.log(userProfile);
    }

    useEffect(() => {
        onLoad();
    }, [])

    return (
        <div className="TenantProfile">

        </div>
    )
}