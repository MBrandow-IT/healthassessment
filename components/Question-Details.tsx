"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";

import QuestionChart from "./Question-Chart";
import { getToken } from "@/actions/auth.actions";

interface CongregationsProps {
  Congregation_ID: number;
  Congregation_Name: string;
}

interface QuestionDetailsProps {
  Question_Title: string;
  Question_Description: string;
  Question_Section: string;
  Question_Category: string;
  Answer_SELECT: string;
}

interface QuestionMonthNumbersProps {
  Fiscal_Period_Start: string;
  Month_Value: number;
  Last_Years_Value: number;
  Fiscal_Period_ID: number;
}

interface UserProps {
  userid: number;
}

const getSelectedQuestion = async (
  questionID: number,
  grabAllData: boolean,
  congregationID: number
) => {
  console.log(questionID, grabAllData, congregationID);
  return await axios({
    method: "post",
    url: "https://my.pureheart.org/ministryplatformapi/procs/PHC_SelectedQuestionInfo",
    data: {
      "@MinistryQuestionID": questionID,
      "@CongregationID": congregationID,
      "@GrabAllData": grabAllData,
    },
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      "Content-Type": "Application/JSON",
    },
  }).then((response) => response.data);
};

interface QuestionProps {
  id: number;
}

const Question = ({id}: QuestionProps) => {
  const congregation = parseInt(localStorage.getItem("Congregation_ID") || "0");
  
  const [user, setUser] = useState<UserProps | null>(null);
  const [questionDetails, setQuestionDetails] = useState<QuestionDetailsProps | null>(null);
  const [questionMonthNumbers, setQuestionMonthNumbers] = useState<QuestionMonthNumbersProps[]>([]);
  const [congregations, setCongregations] = useState<CongregationsProps[]>([]);
  const [congregationID, setCongregationID] = useState<number>(congregation);


  useEffect(() => {
    const cookieUser = Cookies.get("user");
    if (cookieUser) setUser(JSON.parse(cookieUser));
  }, []);

  useEffect(() => {
    if (user?.userid) {
      getSelectedQuestion(id, true, congregationID)
        .then((data) => {
          const [monthNumbers, questionDetailsData, congregationsData] = data;
          setQuestionMonthNumbers(monthNumbers);
          setQuestionDetails(questionDetailsData[0]);
          setCongregations(congregationsData);
          console.log(data)
        })
        .catch((err) => console.log(err))
    }
  }, [user, id, congregationID]);

  useEffect(() => {
    if (user?.userid) {
      getSelectedQuestion(id, false, congregationID)
        .then((data) => {
          const [qData] = data;
          setQuestionMonthNumbers(qData);
        })
        .catch((err) => console.log(err))
    }
  }, [congregationID, user, id]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCongregationID(parseInt(e.target.value));
  };

  return (
    <div id="question-information-body">
      <select
        name="congregationSelect"
        id="congregationSelect"
        value={congregationID}
        onChange={handleChange}
      >
        {congregations.map((congregation, index) => (
          <option key={index} value={congregation.Congregation_ID}>
            {congregation.Congregation_Name}
          </option>
        ))}
      </select>
      <div id="question-information-container">
        {questionDetails && (
          <>
            <h2>
              {questionDetails.Question_Title} id: {id}
            </h2>
            <div className="question-information-divider">
              <h2>Question Description:</h2>
              <p>{questionDetails.Question_Description}</p>
            </div>
            <div id="question-information-combine">
              <div className="question-information-divider">
                <h2>Question Section:</h2>
                <p>{questionDetails.Question_Section}</p>
              </div>
              <div className="question-information-divider">
                <h2>Question Category:</h2>
                <p>{questionDetails.Question_Category}</p>
              </div>
            </div>
            <div className="question-information-divider" id="question-line-chart">
              <QuestionChart chartData={questionMonthNumbers} />
            </div>
            <div className="question-information-divider" id="question-table-container">
              <table>
                <tbody>
                  <tr>
                    <th>Month and Year</th>
                    <th>Value</th>
                    <th>Previous Year's Value</th>
                    <th>% Difference</th>
                  </tr>
                  {questionMonthNumbers.slice(0, 13).map((month, i) => {
                    const {
                      Fiscal_Period_Start,
                      Month_Value,
                      Last_Years_Value,
                      Fiscal_Period_ID,
                    } = month;
                    return (
                      <tr key={i}>
                        <td>
                          <a href={`/healthassessment/${id}/${Fiscal_Period_ID}`}>
                            {new Date(Fiscal_Period_Start).toLocaleDateString(
                              "en-us",
                              { month: "short", year: "numeric" }
                            )}
                          </a>
                        </td>
                        <td>{Month_Value}</td>
                        <td>{Last_Years_Value}</td>
                        <td>
                          {(
                            ((Month_Value - Last_Years_Value) / Last_Years_Value) *
                            100
                          ).toFixed(2)}
                          %
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="question-information-divider">
              <h2>SQL Select:</h2>
              <p dangerouslySetInnerHTML={{ __html: questionDetails.Answer_SELECT }}></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Question;
