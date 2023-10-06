import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    line-height: 1.5;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  .card-view-software{
    width: -webkit-fill-available;
  }
  #app {
    background-color: #fff;
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    line-height: 1.5em;
  }

  input, select {
    font-family: inherit;
    font-size: inherit;
  }

  .w-85 {
    width: 85%;
    margin: 0 auto;    
@media screen and (max-width: 763px) {
  width:90%
}
  }
  .quiz_question_text img {
    max-width: 90% !important;
  }
  #ThemeDark{
     background-color:#fff
  }
  .custom_loader {
  border: 2px solid #d1d1d1; /* Light grey */
  border-top: 2px solid #1BD4D5; /* Blue */
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin:10px auto auto;
  animation: spin 2s linear infinite;
  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.WaitText{
  font-size:10px;
  white-space:nowrap;
}
.flexBox{
  display:flex;
}
`;

export default GlobalStyle;
