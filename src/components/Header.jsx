import React from "react";
import { Avatar, Button } from "antd";
import { AntDesignOutlined } from "@ant-design/icons";
import { shortAddress } from "../utils/shortAddress.js";

export default function Header({ disconnect, walletAddress }) {
  return (
    <div className="flex items-start justify-between px-5 py-2">
      <div className="flex items-center">
        <Avatar
          icon={<AntDesignOutlined />}
          style={{ backgroundColor: "#1677ff" }}
          className="mr-2"
        />
        <p className="text-sm font-bold my-0">
          {shortAddress(walletAddress || "", 5)}
        </p>
      </div>
      <div>
        <Button
          className="text-sm font-regular my-0 cursor-pointer"
          onClick={disconnect}
        >
          {"Disconnect"}
        </Button>
      </div>
    </div>
  );
}
