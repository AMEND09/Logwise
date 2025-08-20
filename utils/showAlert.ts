import { Alert } from 'react-native';

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export function showAlert(title: string, message: string, buttons?: AlertButton[]) {
  if (typeof window !== 'undefined') {
    if (!buttons || buttons.length === 0) {
      window.alert(`${title}\n\n${message}`);
      return;
    }

    if (buttons.length === 1) {
      const b = buttons[0];
      window.alert(`${title}\n\n${message}`);
      if (b.onPress) b.onPress();
      return;
    }

    const okButton = buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];
    const ok = window.confirm(`${title}\n\n${message}`);
    if (ok && okButton && okButton.onPress) okButton.onPress();
    return;
  }

  return Alert.alert(title, message, buttons as any);
}

export default showAlert;
