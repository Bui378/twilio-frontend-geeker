import React, { memo, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import * as Antd from 'antd';
import { useHistory } from 'react-router-dom';
import H1 from '../../../components/common/H1';
 import { useLocation  } from 'react-router';
import messages from './messages';
import styled from 'styled-components';
// import queryString from 'query-string';
import { LayoutMax } from '../../../components/Layout';
import Header from '../../../components/NewHeader';
import FormItem from '../../../components/FormItem';
import InputPassword from '../../../components/AuthLayout/InputPassword';
import Footer from '../../../components/AuthLayout/Footer';
import Link from '../../../components/AuthLayout/Link';
import { useAuth } from '../../../context/authContext';
import { openNotificationWithIcon } from '../../../utils';
function ChagePasswordPage() {
  const {ChangePasswordHandler} = useAuth()
  // const [token, setToken] = useState('');
  const loading = false;
  // const {t} = useParams();
  const isValidToken = true;
  const location = useLocation()
  const history = useHistory();
  let tk = ''
  

  const onSendResetRequest = value => {
    console.log(">>>!>>>!!>>>>")
    onResetCall();

     if(location.search){
    let params = new URLSearchParams(location.search)
    
   tk = params.get('t')
   ChangePasswordHandler({ ...value, token:tk })
   openNotificationWithIcon('success', 'Success', "Your Password has been successfully changed");
   history.push("/")

   }

    
  };

  /*const verifyToken = useCallback(
    value => {
    },
    [],
  );*/

  const onResetCall = useCallback(
    value => {
    },
    [],
  );

  return (
    <Container>
      <LayoutMax bg="transparent">
        <Header link="/" />
        <LayoutMax.Content className="items-center">
          {loading && (
            <H1>
              <FormattedMessage {...messages.loading} />
            </H1>
          )}
          {!loading && !isValidToken && (
            <H1>
              <FormattedMessage {...messages.notValidToken} />
            </H1>
          )}
          {!loading && isValidToken && (
          <React.Fragment key="isValidToken">
              <Antd.Form className="items-center" onFinish={onSendResetRequest}>
                <FormItem
                  name="password"
                  label="Password:"
                  className="d-flex flex-column"
                  rules={[
                    () => ({
                      validator(_, value) {
                        const re = /^(?=.*[a-z])(?=.*[0-9])(?=.*[\^$*.[\]{}()?\-“!@#%&/,><’:;|_~`])\S{6,99}$/;
                        if (!re.test(String(value))) {
                          return Promise.reject(
                            new Error(
                              'Passwords must include at least six numbers, letters, and special characters (like ! and &)',
                            ),
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <InputPassword
                    name="password"
                    size="large"
                    placeholder="Password"
                    border="0px none"
                    borderbottom = "1px solid gray"
                    border_radius = "0px"
                  />
                </FormItem>
                <FormItem
                  name="confrim_password"
                  label="Confirm Password:"
                  className="d-flex flex-column"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            'The two passwords that you entered do not match!',
                          ),
                        );
                      },
                    }),
                  ]}
                >
                  <InputPassword
                    name="confirmPassword"
                    size="large"
                    placeholder="Confirm Password"
                    border="0px none"
                    borderbottom = "1px solid gray"
                    border_radius = "0px"
                  />
                </FormItem>
                <button
                  type="Primary"
                  size = "large"
                  className="app-btn"
                  htmlType="submit"
                   loading={loading}
                >
                  Reset
                </button>
              </Antd.Form>
              </React.Fragment>
          )}
          <div>
            <Footer>
              <span>
                <FormattedMessage {...messages.needAnAccount} />
                &nbsp;
              </span>
              <Link to="/register">
                <FormattedMessage {...messages.register} />
              </Link>
            </Footer>
            <Link to="/login">
              <FormattedMessage {...messages.btnLogin} />
            </Link>
          </div>
        </LayoutMax.Content>
        <div />
      </LayoutMax>
    </Container>
  );
}


const Container = styled.div`
  width:40%;
  margin: 0 auto;
`;


ChagePasswordPage.propTypes = {};

export default memo(ChagePasswordPage);
