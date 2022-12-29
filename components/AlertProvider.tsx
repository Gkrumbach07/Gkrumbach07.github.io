import { ColorPaletteProp, IconButton } from "@mui/joy";
import Alert from "@mui/joy/Alert";
import React, { useState, useContext, useCallback } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import Stack from "@mui/system/Stack";

type AlertType = { id: number, type: ColorPaletteProp, content: any }
const AlertContext = React.createContext<{ addAlert: (content: any, type: ColorPaletteProp) => void, removeAlert: (id: number) => void }>({ addAlert: () => { }, removeAlert: () => { } });
let id = 1;

const AlertProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const addAlert = useCallback((content: any, type: ColorPaletteProp) => {
    setAlerts(alerts => [...alerts, { id: id++, type, content }]);
  }, [setAlerts]);

  const removeAlert = useCallback((id: number) => {
    setAlerts(alerts => alerts.filter(t => t.id !== id))
  }, [setAlerts]);


  return (

    <AlertContext.Provider
      value={{
        addAlert,
        removeAlert
      }}
    >
      <Stack spacing={1} sx={{
        position: "fixed",
        left: "0px",
        bottom: "0px",
        padding: 1,
        zIndex: 100
      }}>
        {alerts.map(alert => {
          return (
            <Alert
              key={alert.id}
              variant="solid"
              color={alert.type}
              endDecorator={
                <IconButton variant="plain" size="sm" color="neutral" onClick={() => removeAlert(alert.id)}>
                  <CloseRoundedIcon />
                </IconButton>
              }
              sx={{ width: '100%' }}>
              {alert.content}
            </Alert>

          )
        })}
      </Stack>

      {children}
    </AlertContext.Provider>

  );
};

const useAlert = () => {
  const alertHelpers = useContext(AlertContext);
  return alertHelpers;
};

export { AlertContext, useAlert };
export default AlertProvider;
