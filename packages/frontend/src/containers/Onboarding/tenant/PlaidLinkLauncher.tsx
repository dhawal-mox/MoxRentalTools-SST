import { useEffect } from "react";
import {
  usePlaidLink,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOnExitMetadata,
  PlaidLinkError,
  PlaidLinkOptionsWithLinkToken,
  PlaidLinkOnEventMetadata,
  PlaidLinkStableEvent,
} from "react-plaid-link";

interface Props {
  isIncome?: boolean;
  token: string;
  successCallback: (_: string) => void;
  exitCallback?: () => void;
}

/**
 * Launches Link, calling props.successCallback when complete. This could have
 * been combined with the LinkLoader, but it got a bit unweildy
 */
export default function LaunchLink(props: Props) {
  // define onSuccess, onExit and onEvent functions as configs for Plaid Link creation
  const onSuccess = async (
    publicToken: string,
    metadata: PlaidLinkOnSuccessMetadata
  ) => {
    props.successCallback(publicToken);
  };

  const onExit = async (
    error: PlaidLinkError | null,
    metadata: PlaidLinkOnExitMetadata
  ) => {
    console.log(`onExit. error=${error}\nmetadata=${JSON.stringify(metadata)}`);
    if(props.exitCallback){
      props.exitCallback();
    }
  };

  const onEvent = async (
    eventName: PlaidLinkStableEvent | string,
    metadata: PlaidLinkOnEventMetadata
  ) => {
    console.log(`Event: ${eventName}, Metadata: ${metadata}`);
  };

  const config: PlaidLinkOptionsWithLinkToken = {
    onSuccess,
    onExit,
    onEvent,
    token: props.token,
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open, props.token]);

  return <></>;
}