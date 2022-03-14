import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { QueryClient, QueryClientProvider } from "react-query";
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import AppBasic from "AppBasic";
import MyThemeProvider from "MyThemeProvider";
import Home from "view/Home";
import Clipboard from 'view/ClipboardPage';
import { CssBaseline, ThemeProvider } from '@mui/material';

const queryClient = new QueryClient();

function NoMatch() {
  let location = useLocation();
  return (
    <div>
      <h3>
        Location <code>{location.pathname}</code> not found
      </h3>
      <a href={"/"}><h6>Goto Home</h6></a>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <MyThemeProvider >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clipboard/:clipId" element={<AppBasic><Clipboard /></AppBasic>} />
            <Route path="*" element={NoMatch} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </MyThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
