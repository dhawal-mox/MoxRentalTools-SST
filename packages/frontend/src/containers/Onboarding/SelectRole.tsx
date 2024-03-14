import React, { useEffect, useState } from 'react';
import "./SelectRole.css";
import { Stack } from "react-bootstrap";
import { useAppContext } from '../../lib/contextLib';
import { UserRole } from '../../types/user';
import { getCurrentUser, getUserOnboardingStatus, updateUserRole } from '../../lib/userLib';
import { useLocation, useNavigate } from 'react-router-dom';
import { onboarding } from '../../lib/onboardingLib';
import LoaderButton from '../../components/LoaderButton';

interface RoleCardProps {
  title: string;
  description: string;
  userRole: UserRole;
  onSelect: () => void;
}

export default function SelectRole() {
  const roles = [
    { title: 'Tenant', description: 'Create your verified tenant profile and share with landlords & agents.', userRole: UserRole.Tenant },
    { title: 'Landlord', description: 'Request and view prospective tenants\' verified profiles.', userRole: UserRole.Landlord },
    { title: 'Real Estate Agent', description: 'Request and view prospective tenants\' verified profiles.', userRole: UserRole.Agent },
  ];

  const RoleCard: React.FC<RoleCardProps> = ({ title, description, userRole, onSelect }) => {
    return (
    <div className="card" style={{ width: '18rem' }}>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <LoaderButton onClick={onSelect} className="btn btn-primary" isLoading={selectedRole == userRole} disabled={isLoading}>
          Select
        </LoaderButton>
      </div>
    </div>
  )};

  const { user, setUser } = useAppContext();
  const { userOnboardingStatus, setUserOnboardingStatus } = useAppContext();
  const nav = useNavigate();
  const { pathname } = useLocation();
  // const [ updatedUserOnboardingStatus, setUpdatedUserOnboardingStatus ] = useState<OnboardingStatusType>({});
  const [ selectedRole, setSelectedRole ] = useState<UserRole>();
  const [ isLoading, setIsLoading ] = useState(false);

  useEffect(() => {
    onboarding(nav, user, userOnboardingStatus, pathname);
  }, [])

  useEffect(() => {
    onboarding(nav, user, userOnboardingStatus, pathname);
  }, [userOnboardingStatus]);

  async function handleSelect(userRole: UserRole)  {
    console.log(`Selected role: ${userRole}`);
    // Implement your selection handling logic here
    setSelectedRole(userRole);
    setIsLoading(true);
    await updateUserRole(user, userRole);
    const updatedUser = await getCurrentUser();
    setUser(updatedUser);
    setUserOnboardingStatus(await getUserOnboardingStatus(updatedUser));
    console.log(`Updated user received: ${updatedUser}`);
    // // nav('/');
  };

  return (
    <div className="CardContainer">
        <Stack gap={3}>
            <h3 className="headerText">Hi {user.first_name}, what will you be using MOX Rental Tools for?</h3>
            <div className="CardCol">
                {roles.map((role, index) => (
                <div key={index} className="row-sm">
                    <RoleCard
                    title={role.title}
                    description={role.description}
                    userRole={role.userRole}
                    onSelect={() => handleSelect(role.userRole)}
                    />
                </div>
                ))}
            </div>
        </Stack>
    </div>
  );
};
