# PDF Q&A Application
## Overview
This is a full-stack web application that allows users to upload PDF documents and ask questions regarding the content of these documents. The backend processes the documents using natural language processing (NLP) techniques to provide answers to the user's questions. The frontend provides an intuitive interface for users to upload documents, ask questions, and view answers.

## Features
PDF Upload: Users can upload PDF documents to the application. The application stores the PDF and extracts its text content for further processing.
Asking Questions: Users can ask questions related to the content of an uploaded PDF. The system processes the question and the content of the PDF to provide an answer.
Displaying Answers: The application displays the answer to the user's question. Users can also ask follow-up or new questions on the same document.

## Technologies Used -
React, LlamaIndex, FastAPI, Local Storage for saving files

## Description
This is a project which uses React, llamaindex and fastAPI to upload pdf and then convert them to their respective txt files in an uploads folder which is created when someone enters a document for the first time.

![Screenshot 2024-06-21 222725](https://github.com/JaySingh23/pdf-chatbot/assets/64877729/83249aa3-74fe-4f39-89f1-f8da9b5cc712)

From this txt file, then all the information is uploaded to a model and with the help of a llm, it is then used to answer the queries which are asked. 
There are 2 API endpoints created thus. One for the uploading of pdfs and the other for returning the answer generated by the model.

Below is a short video which showcases how it works.

