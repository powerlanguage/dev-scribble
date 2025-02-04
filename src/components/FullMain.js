import styled from "@emotion/styled";
import { flexCenter } from "./styles";

const FullMain = styled.main`
  min-height: 100vh;
  min-height: -webkit-fill-available;
  width: 100vw;
  ${flexCenter};
  text-align: center;
`;

export default FullMain;
