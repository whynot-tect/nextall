// File: C:\Users\hanos\nextall\frontend\src\theme\overrides\dialog.js
export default function Dialog(theme) {
  return {
    MuiDialog: {
      defaultProps: {
        dir: theme.direction
      },
      styleOverrides: {
        paper: {
          width: '100%',
          margin: 0,
          border: `1px solid ${theme.palette.divider}`,
          '&.MuiPaper-rounded': {
            borderRadius: theme.shape.borderRadiusMd
          },
          '&.MuiDialog-paperFullScreen': {
            borderRadius: 0
          },
          '&.MuiDialog-paper .MuiDialogActions-root': {
            padding: theme.spacing(3)
          },
          '@media (max-width: 600px)': {
            margin: theme.spacing(2)
          },
          '@media (max-width: 663.95px)': {
            '&.MuiDialog-paperWidthSm.MuiDialog-paperScrollBody': {
              maxWidth: '100%'
            }
          }
        },
        paperFullWidth: {
          width: '100%'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0)
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          borderTop: 0,
          borderBottom: 0,
          padding: theme.spacing(3)
        }
      }
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          '& > :not(:first-of-type)': {
            marginLeft: theme.spacing(1.5)
          }
        }
      }
    }
  };
}
