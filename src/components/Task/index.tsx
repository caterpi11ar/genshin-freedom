import React, { useState } from "react";
import { List, Checkbox } from "antd";

interface TaskListProps {
  tasks: { label: string; value: string }[];
  selectedValues: string[];
  setSelectedValues: (values: string[]) => void
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedValues,
  setSelectedValues,
}) => {
  return (
    <List
      style={{ height: 300, overflowY: "auto" }}
      bordered
      dataSource={tasks}
      renderItem={(item) => (
        <List.Item style={{ padding: 12 }}>
          <Checkbox
            checked={selectedValues.includes(item.value)}
            onChange={(e) => {
              const newSelectedValues = e.target.checked
                ? [...selectedValues, item.value]
                : selectedValues.filter((value) => value !== item.value);
              setSelectedValues(newSelectedValues);
            }}
          >
            {item.label}
          </Checkbox>
        </List.Item>
      )}
    />
  );
};

export default TaskList;
