import { InboxOutlined } from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import type { UploadProps } from "antd";
import { RcFile } from "antd/es/upload";

type Props = {
  setFile: (file: RcFile) => void;
};

export default function UploadFile({ setFile }: Props) {
  const props: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".csv",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
  };

  return (
    <Dragger {...props} className="w-full">
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag file to this area to upload
      </p>
      <p className="ant-upload-hint">Supported file types: CSV</p>
    </Dragger>
  );
}
