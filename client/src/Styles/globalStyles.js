import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    *{
        box-sizing: border-box;
    }
    html{
        font-size: 20px;
        width: 100%;
        &:lang(ko) {
            font-family: 'Do Hyeon', sans-serif;
        }
        &:lang(en){
            font-family: 'Lobster', cursive;
        }
    }
    body{
        width: 100%;
		overflow: scroll; /* Show scrollbars */
    }
    a{
        text-decoration: none;
    }
    input:focus{
        outline: none;
    }

`;

export default GlobalStyles;
