import { Button, Input, Space } from "antd";
import { usePlenaWallet } from "plena-wallet-sdk";
import Header from "./components/Header";

function App() {
  const { openModal, closeConnection, sendTransaction, walletAddress } =
    usePlenaWallet();

  const disconnect = async () => {
    closeConnection();
  };
  return (
    <>
      {!walletAddress ? (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="mb-8 text-2xl font-bold">Welcome to Plena Connect</h1>
          <Button
            type="primary"
            onClick={openModal}
            className="text-sm font-bold"
          >
            Connect
          </Button>
        </div>
      ) : (
        <div className=" h-full">
          <Header disconnect={disconnect} walletAddress={walletAddress} />
          <Space.Compact block size="small">
            <Input
              style={{
                width: "40%",
              }}
              placeholder="Enter amount of usdt to swap"
            />
            <Button type="primary">Submit</Button>
          </Space.Compact>
        </div>
      )}
    </>
  );
}

export default App;
