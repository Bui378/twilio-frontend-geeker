import React from "react";
import { AuthProvider } from "./authContext";
import { UserProvider } from "./useContext";
import { JobProvider } from "./jobContext";
import { QuizProvider } from "./quizContext";
import { SocketProvider } from "./socketContext";
import { JitsiMeetProvider } from "./jitsiMeetContext";
import { FeedbackProvider } from "./feedbackContext";
import { ProposalProvider } from "./propsalContext";
import { ServicesProvider } from './ServiceContext';
import { NotificationProvider } from './notificationContext';
import { BillingDetailsProvider } from './billingDetailsContext';
import { EarningDetailsProvider } from './earningDetailsContext';
import { ToolsContextProvider } from './toolContext';
import { ChatEngineProvider } from './chatContext';
import { DiscountHistoryProvider } from './discountContext';
function AppProviders({ children }) {
  return (
    <ToolsContextProvider>
      <AuthProvider>
        <UserProvider>
          <JobProvider>
            <ProposalProvider>
              <QuizProvider>
                <JitsiMeetProvider>
                  <FeedbackProvider>
                    <ServicesProvider>
                      <NotificationProvider>
                        <BillingDetailsProvider>
                          <EarningDetailsProvider>
                            <ChatEngineProvider>
                              <DiscountHistoryProvider>
                                <SocketProvider>{children}</SocketProvider>
                              </DiscountHistoryProvider>
                            </ChatEngineProvider>
                          </EarningDetailsProvider>
                        </BillingDetailsProvider>
                      </NotificationProvider>
                    </ServicesProvider>
                  </FeedbackProvider>
                </JitsiMeetProvider>
              </QuizProvider>
            </ProposalProvider>
          </JobProvider>
        </UserProvider>
      </AuthProvider>
    </ToolsContextProvider>
  );
}

export default AppProviders;
