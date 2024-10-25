import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function App() {
  const [mail, sendMail] = useState("");
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  const handleMsg = (event) => {
    sendMail(event.target.value);
  };

  const handleFile = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const emailData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Use header: 1 for array output
      const totalEmail = emailData.map(row => row[0]); // Map to first column
      console.log(totalEmail);
      setEmailList(totalEmail.filter(email => email)); // Filter out any empty entries
    };

    reader.readAsArrayBuffer(file); // Ensure the reader reads as an ArrayBuffer
  };

  const send = () => {
    setStatus(true);

    const payload = {
      msg: mail,
      emailList: emailList.filter(email => email) // Filter out any empty emails
    };

    console.log("Sending payload:", payload); // Log the payload

    axios
      .post("http://localhost:5000/sendemail", payload)
      .then(function (response) {
        if (response.data.success) {
          alert("Emails sent successfully");
        } else {
          alert("Failed to send emails");
        }
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("An error occurred while sending the email");
      })
      .finally(() => {
        setStatus(false); // Reset the status regardless of success or failure
      });
  };

  return (
    <div>
      <div className="bg-purple-800 text-white text-center">
        <h1 className="p-4">Bulk Mail</h1>
      </div>
      <div className="bg-purple-700 text-white text-center">
        <h1 className="font-medium p-4">
          We can help your business with sending multiple emails at once
        </h1>
      </div>
      <div className="bg-purple-600 text-white text-center">
        <h1 className="font-medium p-4">Drag and Drop</h1>
      </div>
      <div className="bg-purple-500 flex flex-col px-2 items-center text-black p-6">
        <textarea
          onChange={handleMsg}
          value={mail}
          className="w-[80%] h-32 border border-black rounded-md text-center outline-none py-2 px-2"
          placeholder="Enter your email"
        ></textarea>
        <div className="bg-purple-400 p-4 text-center mt-4">
          <input
            onChange={handleFile}
            type="file"
            className="border-2 border-dashed mt-2 border-gray p-2 m-4"
          />
        </div>
        <p className="mt-2">Total emails in the list: {emailList.length}</p>
        <button
          onClick={send}
          className="bg-purple-950 border rounded-md p-2 text-white mt-2"
        >
          {status ? "Sending..." : "Send"}
        </button>
      </div>
      <div className="bg-purple-300 text-white text-center p-6"></div>
      <div className="bg-purple-200 text-white text-center p-6"></div>
    </div>
  );
}

export default App;
