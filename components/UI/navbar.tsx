import Link from "next/link";
import React, { useState, useEffect, FunctionComponent } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import styles from "../../styles/components/navbar.module.css";
import Button from "./button";
import {
  useConnectors,
  useAccount,
  useProvider,
  useTransactionManager,
  Connector,
} from "@starknet-react/core";
import Wallets from "./wallets";
import ModalMessage from "./modalMessage";
import { useDisplayName } from "../../hooks/displayName.tsx";
import { useMediaQuery } from "@mui/material";
import { CircularProgress } from "@mui/material";
import ModalWallet from "./modalWallet";
import { constants } from "starknet";
import { useTheme } from "@mui/material/styles";
import ProfilFilledIcon from "./iconsComponents/icons/profilFilledIcon";

const Navbar: FunctionComponent = () => {
  const theme = useTheme();
  const [nav, setNav] = useState<boolean>(false);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const { address } = useAccount();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const { available, connect, disconnect, refresh, connectors } =
    useConnectors();
  const { provider } = useProvider();
  const isMobile = useMediaQuery("(max-width:425px)");
  const domainOrAddress = useDisplayName(address ?? "", isMobile);
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet";
  const [txLoading, setTxLoading] = useState<number>(0);
  const { hashes } = useTransactionManager();
  const [showWallet, setShowWallet] = useState<boolean>(false);

  useEffect(() => {
    async function tryAutoConnect(connectors: Connector[]) {
      // to handle autoconnect starknet-react adds connector id in local storage
      // if there is no value stored, we show the wallet modal
      const lastConnectedConnectorId =
        localStorage.getItem("lastUsedConnector");
      if (lastConnectedConnectorId === null) {
        return;
      }

      const lastConnectedConnector = connectors.find(
        (connector) => connector.id === lastConnectedConnectorId
      );
      if (lastConnectedConnector === undefined) {
        return;
      }

      try {
        if (!(await lastConnectedConnector.ready())) {
          // Not authorized anymore.
          return;
        }

        await connect(lastConnectedConnector);
      } catch {
        // no-op
      }
    }

    const timeout = setTimeout(() => {
      if (!address) {
        tryAutoConnect(connectors);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    address ? setIsConnected(true) : setIsConnected(false);
  }, [address]);

  useEffect(() => {
    if (!isConnected) return;

    provider.getChainId().then((chainId) => {
      const isWrongNetwork =
        (chainId === constants.StarknetChainId.SN_GOERLI &&
          network === "mainnet") ||
        (chainId === constants.StarknetChainId.SN_MAIN &&
          network === "testnet");
      setIsWrongNetwork(isWrongNetwork);
    });
  }, [provider, network, isConnected]);

  function disconnectByClick(): void {
    disconnect();
    setIsConnected(false);
    setIsWrongNetwork(false);
    setHasWallet(false);
    setShowWallet(false);
  }

  function handleNav(): void {
    setNav(!nav);
  }

  function onTopButtonClick(): void {
    if (!isConnected) {
      refresh();
      if (available.length > 0) {
        if (available.length === 1) {
          connect(available[0]);
        } else {
          setHasWallet(true);
        }
      } else {
        setHasWallet(true);
      }
    } else {
      // disconnectByClick();
      setShowWallet(true);
    }
  }

  function topButtonText(): string | undefined {
    const textToReturn = isConnected ? domainOrAddress : "connect wallet";

    return textToReturn;
  }

  // Refresh available connectors before showing wallet modal
  function refreshAndShowWallet(): void {
    refresh();
    setHasWallet(true);
  }

  return (
    <>
      <div className={"fixed w-full z-[1] bg-background"}>
        <div className={styles.navbarContainer}>
          <div className="ml-4">
            <Link href="/" className="cursor-pointer">
              <img
                className="cursor-pointer"
                src="/visuals/StarknetIdLogo.svg"
                alt="Starknet.id Logo"
                width={90}
                height={90}
              />
            </Link>
          </div>
          <div>
            <ul className="hidden lg:flex uppercase items-center">
              <Link href="/identities">
                <li className={styles.menuItem}>My Identities</li>
              </Link>
              <Link href="/">
                <li className={styles.menuItem}>Domains</li>
              </Link>
              {/* <Link href="/jointhetribe">
                <li className={styles.menuItem}>Join the tribe</li>
              </Link> */}
              <div className="text-beige mx-5">
                <Button
                  onClick={
                    isConnected
                      ? () => setShowWallet(true)
                      : () => refreshAndShowWallet()
                  }
                >
                  {isConnected ? (
                    <>
                      {txLoading > 0 ? (
                        <div className="flex justify-center items-center">
                          <p className="mr-3">{txLoading} on hold</p>
                          <CircularProgress
                            sx={{
                              color: "white",
                            }}
                            size={25}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center">
                          <p className="mr-3">{domainOrAddress}</p>
                          <ProfilFilledIcon
                            width="24"
                            color={theme.palette.background.default}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    "connect"
                  )}
                </Button>
              </div>
            </ul>
            <div onClick={handleNav} className="lg:hidden">
              <AiOutlineMenu
                color={theme.palette.secondary.main}
                size={25}
                className="mr-3"
              />
            </div>
          </div>
        </div>

        <div
          className={
            nav
              ? "lg:hidden fixed left-0 top-0 w-full h-screen bg-black/10"
              : ""
          }
        >
          <div
            className={
              nav
                ? "fixed left-0 top-0 w-full sm:w-[60%] lg:w-[45%] h-screen bg-background px-5 ease-in duration-500 flex justify-between flex-col"
                : "fixed left-[-100%] top-0 p-10 ease-in h-screen flex justify-between flex-col"
            }
          >
            <div className="h-full flex flex-col">
              <div className="flex w-full items-center justify-between">
                <div>
                  <Link href="/" className="cursor-pointer">
                    <img
                      className="cursor-pointer"
                      src="/visuals/StarknetIdLogo.svg"
                      alt="Starknet.id Logo"
                      width={90}
                      height={90}
                    />
                  </Link>
                </div>

                <div
                  onClick={handleNav}
                  className="rounded-lg cursor-pointer bg-secondary p-1"
                >
                  <AiOutlineClose
                    color={theme.palette.background.default}
                    size={isMobile ? 25 : 20}
                  />
                </div>
              </div>
              <div className="py-4 my-auto text-center font-extrabold">
                <div>
                  <ul className="uppercase">
                    <Link href="/identities">
                      <li
                        onClick={() => setNav(false)}
                        className={styles.menuItemSmall}
                      >
                        My Identities
                      </li>
                    </Link>
                    <Link href="/">
                      <li
                        onClick={() => setNav(false)}
                        className={styles.menuItemSmall}
                      >
                        Domains
                      </li>
                    </Link>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center my-4 w-full">
              <div className="text-background">
                <Button onClick={onTopButtonClick}>{topButtonText()}</Button>
              </div>
              <div className="flex">
                <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300 mt-2">
                  <Link href="https://twitter.com/Starknet_id">
                    <FaTwitter size={28} color={theme.palette.secondary.main} />
                  </Link>
                </div>
                <div className="rounded-full shadow-gray-400 p-3 cursor-pointer hover:scale-105 ease-in duration-300 mt-2">
                  <Link href="https://discord.com/invite/8uS2Mgcsza">
                    <FaDiscord size={28} color={theme.palette.secondary.main} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalMessage
        open={isWrongNetwork}
        title={"Wrong network"}
        closeModal={() => setIsWrongNetwork(false)}
        message={
          <div className="mt-3 flex flex-col items-center justify-center text-center">
            <p>
              This app only supports Starknet {network}, you have to change your
              network to be able use it.
            </p>
            <div className="mt-3">
              <Button onClick={() => disconnectByClick()}>
                {`Disconnect`}
              </Button>
            </div>
          </div>
        }
      />
      <ModalWallet
        domain={domainOrAddress}
        open={showWallet}
        closeModal={() => setShowWallet(false)}
        disconnectByClick={disconnectByClick}
        hashes={hashes}
        setTxLoading={setTxLoading}
      />
      <Wallets
        closeWallet={() => setHasWallet(false)}
        hasWallet={Boolean(hasWallet && !isWrongNetwork)}
      />
    </>
  );
};

export default Navbar;
