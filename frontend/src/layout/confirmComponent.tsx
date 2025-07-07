import { Button, Modal, Text } from "@mantine/core";
import { useTranslation } from "next-i18next";
interface CustomConfirmProps {
  buttonColor?: string;
  buttonLabel?: string;
}
interface Props {
  opened: boolean;
  title: string;
  description: string;
  confirmAction: () => void;
  onClose: () => void;
  customConfirmProps?: CustomConfirmProps;
}
export default function ConfirmComponent(props: Props) {
  const {
    opened,
    description,
    title,
    confirmAction,
    onClose,
    customConfirmProps,
  } = props;
  const { t } = useTranslation();
  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Text>{description}</Text>
      <div className="flex mt-2 gap-2 justify-end">
        <Button onClick={onClose} color="gray" variant="outline" autoFocus>
          {t("common:cancel")}
        </Button>

        <Button
          onClick={confirmAction}
          color={
            customConfirmProps?.buttonColor
              ? customConfirmProps.buttonColor
              : "red"
          }
        >
          {customConfirmProps?.buttonLabel
            ? customConfirmProps.buttonLabel
            : t(`common:delete`)}
        </Button>
      </div>
    </Modal>
  );
}
