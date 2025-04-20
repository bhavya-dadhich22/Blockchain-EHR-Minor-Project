// const contractAddress = "0xYourContractAddress"; // Replace with deployed address
// const contractABI = [ /* Your ABI here */ ];

import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers"; // Fix import

import MedicalRecord from "./MedicalRecord.json";

const contractAddress = "0x2A1462C7D8892865C6E09e8A0Edf508d3918a5cD"; //"0xYourContractAddress"; // Replace with deployed address
const contractABI = MedicalRecord.abi; //[ /* Your ABI here */ ];
function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [record, setRecord] = useState({});
  const [form, setForm] = useState({ name: "", diagnosis: "", treatment: "" });

  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);

          const contractInstance = new Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(contractInstance);

          loadRecord(contractInstance);
        } catch (error) {
          console.error("Wallet connection failed:", error);
        }
      } else {
        alert("Please install MetaMask!");
      }
    }
    connectWallet();
  }, []);

  const loadRecord = async (contractInstance) => {
    try {
      const data = await contractInstance.getRecord();
      console.log("data:", data);
      setRecord({
        name: data[0],
        diagnosis: data[1],
        treatment: data[2],
        doctor: data[3],
      });
    } catch (error) {
      console.log("error-", error);
      console.error("Error fetching record:", error);
    }
  };

  const addRecord = async () => {
    if (!contract) return;
    try {
      const tx = await contract.addRecord(
        form.name,
        form.diagnosis,
        form.treatment
      );
      await tx.wait();
      alert("Record added successfully!");
      loadRecord(contract);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Blockchain Medical Records</h1>
      {account ? <p>Connected: {account}</p> : <p>Not connected</p>}

      <h2>Current Record</h2>
      {record.name ? (
        <div>
          <p>
            <strong>Patient:</strong> {record.name}
          </p>
          <p>
            <strong>Diagnosis:</strong> {record.diagnosis}
          </p>
          <p>
            <strong>Treatment:</strong> {record.treatment}
          </p>
          <p>
            <strong>Doctor:</strong> {record.doctor}
          </p>
        </div>
      ) : (
        <p>No record found</p>
      )}

      <h2>Add New Record</h2>
      <input
        type="text"
        name="name"
        placeholder="Patient Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="text"
        name="diagnosis"
        placeholder="Diagnosis"
        onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
      />
      <input
        type="text"
        name="treatment"
        placeholder="Treatment"
        onChange={(e) => setForm({ ...form, treatment: e.target.value })}
      />
      <button onClick={addRecord}>Submit</button>
    </div>
  );
}

export default App;
