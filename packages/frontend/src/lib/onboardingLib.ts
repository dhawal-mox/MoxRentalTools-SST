import { NavigateFunction } from "react-router-dom";
import { OnboardingStatusType } from "../types/onboardingStatus";
import { UserRole, UserType } from "../types/user";

export function onboarding(nav: NavigateFunction, user: UserType, userOnboardingStatus: OnboardingStatusType, pathname: string) {
    // const nav = useNavigate();
    // returns path to navigate to. returns empty string if no navigation required.
    // console.log(user.userRole === UserRole.Agent);
    switch(userOnboardingStatus.status) {
        case "new_user":
            navigate("/selectRole");
            return;
        case "onboarded":
            navigate("/");
            return;
        case "selected_role":
            if(user.userRole === UserRole.Tenant){
                navigate("/tenantSetup");
            } else if(user.userRole === UserRole.Landlord) {
                navigate("/landlordSetup");
            } else {
                navigate("/agentSetup");
            }
            return;
        case "tenant_setup":
            navigate("/tenantSetup");
            break;
        case "agent_setup":
            if(pathname == "/licenseSubmit") {
                return;
            }
            navigate("/agentSetup");
            break;
        case "landlord_setup":
            navigate("/landlordSetup");
            break;
    }

    function navigate(toPath: string) {
        // don't navigate if user onboarded and path is not one of [onboarding pages]
        if(pathname != toPath) {
            nav(toPath);
        }
    }
}