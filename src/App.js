import { useState } from "react";
import { Button, Input, Space } from "antd";
import { ethers, providers } from "ethers";
import erc20abi from "./utils/erc20abi.json";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import { usePlenaWallet } from "plena-wallet-sdk";
import JSBI from "jsbi";
import {
  AlphaRouter,
  SwapOptionsSwapRouter02,
  SwapType,
} from "@uniswap/smart-order-router";
import Header from "./components/Header";

function App() {
  const { openModal, closeConnection, sendTransaction, walletAddress } =
    usePlenaWallet();

  const [amount, setAmount] = useState(0);

  function fromReadableAmount(amount, decimals) {
    const extraDigits = Math.pow(10, countDecimals(amount));
    const adjustedAmount = amount * extraDigits;
    return JSBI.divide(
      JSBI.multiply(
        JSBI.BigInt(adjustedAmount),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
      ),
      JSBI.BigInt(extraDigits)
    );
  }

  function countDecimals(x) {
    if (Math.floor(x) === x) {
      return 0;
    }
    return x.toString().split(".")[1].length || 0;
  }

  const options = {
    recipient: walletAddress,
    slippageTolerance: new Percent(50, 10_000),
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };

  const USDT_TOKEN = new Token(
    137,
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    6,
    "USDT",
    "Tether USD"
  );

  const USDC_TOKEN = new Token(
    137,
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    6,
    "USDC",
    "USD//C"
  );

  const swap = async () => {
    const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
    const polygonProvider = new ethers.providers.JsonRpcProvider(
      "https://polygon-rpc.com/"
    );
    const router = new AlphaRouter({ chainId: 137, provider: polygonProvider });

    console.log(router);

    const rawTokenAmountIn = fromReadableAmount(amount, USDT_TOKEN.decimals);
    console.log(rawTokenAmountIn[0]);

    const route = await router.route(
      CurrencyAmount.fromRawAmount(USDT_TOKEN, rawTokenAmountIn[0]),
      USDC_TOKEN,
      TradeType.EXACT_INPUT,
      options
    );

    console.log(route);

    const contract = new ethers.Contract(
      USDT_TOKEN.address,
      erc20abi,
      polygonProvider
    );

    console.log(contract);

    const txnData1 = contract.interface.encodeFunctionData("approve", [
      V3_SWAP_ROUTER_ADDRESS,
      rawTokenAmountIn[0],
    ]);

    console.log(txnData1);

    const txnData2 = {
      data: route?.methodParameters?.calldata,
      to: V3_SWAP_ROUTER_ADDRESS,
      value: route?.methodParameters?.value,
      from: walletAddress,
      maxFeePerGas: 100000000000,
      maxPriorityFeePerGas: 100000000000,
    };

    const tx = {
      from: walletAddress,
      data: [txnData1, txnData2],
      to: USDT_TOKEN.address,
      tokens: ["", ""],
      amounts: ["0x0", "0x0"],
    };

    try {
      const res = await sendTransaction({
        chain: 137,
        method: "send_transaction",
        payload: {
          transaction: tx,
        },
      });

      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const disconnect = async () => {
    closeConnection();
  };

  return (
    <>
      {!walletAddress ? (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="mb-8 text-2xl font-bold">Plena Connect X Uniswap</h1>
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
          <Space.Compact block size="small" className="mt-4">
            <Input
              style={{
                width: "40%",
              }}
              onChange
              placeholder="Enter amount of usdt to swap"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button type="primary" onClick={swap}>
              Submit
            </Button>
          </Space.Compact>
        </div>
      )}
    </>
  );
}

export default App;
