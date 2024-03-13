import { NavigateFunction } from "react-router-dom";
import { OnboardingStatusType } from "../types/onboardingStatus";
import { UserRole, UserType } from "../types/user";

export function onboarding(nav: NavigateFunction, user: UserType, userOnboardingStatus: OnboardingStatusType, pathname: string) {
    // const nav = useNavigate();
    // returns path to navigate to. returns empty string if no navigation required.
    switch(userOnboardingStatus.status) {
        case "new_user":
            if(pathname == "/selectRole") {
                return "";
            }
            console.log("navigating");
            nav("/selectRole");
            return "/selectRole";
            break;
        case "onboarded":
            return;
            break;
        case "selected_role":
            if(user.role?.valueOf === UserRole.Tenant.valueOf){
                if(pathname != "/tenantSetup") {
                    nav("/tenantSetup");
                }
            } else if(user.role == UserRole.Landlord) {
                // nav("/landlordSetup");
            } else {
                // nav("agentSetup");
            }
            return;
        case "tenant_setup":
            // nav("/tenant_setup");
    }
}