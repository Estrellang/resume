import React, { useState, useRef, useMemo } from 'react';
import {
  Drawer as AntdDrawer,
  Button,
  Collapse,
  Modal,
  Radio,
  Popover,
  Input,
  Form,
  Space,
} from 'antd';
import {
  DeleteFilled,
  InfoCircleFilled,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import _ from 'lodash-es';
import arrayMove from 'array-move';
import { FormCreator } from '../FormCreator';
import { getDefaultTitleNameMap } from '@/data/constant';
import { FormattedMessage, useIntl } from 'react-intl';
import { MODULES, CONTENT_OF_MODULE } from '@/data/modules';
import type { CustomSection, ResumeConfig, ThemeConfig } from '@/types/resume';
import { ConfigTheme } from './ConfigTheme';
import { Templates } from './Templates';
import './index.less';
import useThrottle from '@/hooks/useThrottle';

const { Panel } = Collapse;

type Props = {
  value: ResumeConfig;
  onValueChange: (v: Partial<ResumeConfig>) => void;
  theme: ThemeConfig;
  onThemeChange: (v: Partial<ThemeConfig>) => void;
  template: string;
  onTemplateChange: (v: string) => void;

  style?: object;
};

type ModuleKey = Exclude<
  keyof ResumeConfig,
  'schemaVersion' | 'locales' | 'template' | 'titleNameMap'
>;
type ListModuleKey = Extract<ModuleKey, `${string}List`>;
type ModuleDefinition = {
  icon: React.ReactNode;
  key: ModuleKey;
  name: string;
};
type DragItem = { index: number };
type DragableRowProps = React.HTMLAttributes<HTMLDivElement> & {
  index: number;
  dragType: string;
  moveRow: (oldIndex: number, newIndex: number) => void;
};

const DragableRow: React.FC<DragableRowProps> = ({
  index,
  dragType,
  moveRow,
  ...restProps
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver, dropClassName }, drop] = useDrop<
    DragItem,
    void,
    { isOver?: boolean; dropClassName?: string }
  >({
    accept: dragType,
    collect: monitor => {
      const dragIndex = (monitor.getItem() as DragItem | null)?.index;
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName:
          dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: item => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag<DragItem, void, unknown>({
    type: dragType,
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <div
      ref={ref}
      className={`${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move' }}
      {...restProps}
    />
  );
};

/**
 * @description 简历配置区
 */
export const Drawer: React.FC<Props> = props => {
  const intl = useIntl();

  const [visible, setVisible] = useState(false);
  const [childrenDrawer, setChildrenDrawer] = useState<ModuleKey | null>(null);
  const [customSectionIndex, setCustomSectionIndex] = useState<number | null>(
    null
  );
  const [customSectionVisible, setCustomSectionVisible] = useState(false);
  const [customSectionForm] = Form.useForm<CustomSection>();
  const [currentContent, updateCurrentContent] = useState<Record<
    string,
    any
  > | null>(null);

  /**
   * 1. 更新currentContent State
   * 2. 调用 props.onValueChange 更新模板
   */
  const updateContent = useThrottle(
    (v: Record<string, any>) => {
      const newConfig = _.merge({}, currentContent, v);
      updateCurrentContent(newConfig);
      props.onValueChange({
        [childrenDrawer]: newConfig,
      });
    },
    [currentContent],
    800
  );

  const [type, setType] = useState('template');

  const swapItems = (moduleKey: string, oldIdx: number, newIdx: number) => {
    const newValues = _.cloneDeep(_.get(props.value, moduleKey, []));
    props.onValueChange({
      [moduleKey]: arrayMove(newValues, oldIdx, newIdx),
    });
  };

  const deleteItem = (moduleKey: string, idx: number) => {
    const newValues = _.get(props.value, moduleKey, []);
    props.onValueChange({
      [moduleKey]: newValues.slice(0, idx).concat(newValues.slice(idx + 1)),
    });
  };

  const modules = useMemo(() => {
    const titleNameMap = props.value?.titleNameMap;
    return MODULES({ intl, titleNameMap }) as ModuleDefinition[];
  }, [intl, props.value?.titleNameMap]);

  const contentOfModule = useMemo(() => {
    return CONTENT_OF_MODULE({ intl });
  }, [intl]);

  const DEFAULT_TITLE_MAP = getDefaultTitleNameMap({ intl });
  const isList = _.endsWith(childrenDrawer, 'List');

  // #region 1 render: moduleContent

  // #region 1.1 render: ModuleList
  const renderModuleList = (
    { icon, key, name }: ModuleDefinition & { key: ListModuleKey },
    idx: number,
    values: Array<Record<string, unknown>>
  ) => {
    const header = (
      <>
        <span className="item-icon">{icon}</span>
        <span className="item-name">
          {DEFAULT_TITLE_MAP[key] ? (
            <Input
              placeholder={DEFAULT_TITLE_MAP[key]}
              bordered={false}
              defaultValue={name}
              onChange={e => {
                props.onValueChange({
                  titleNameMap: {
                    ...(props.value.titleNameMap || {}),
                    [key]: e.target.value,
                  },
                });
              }}
              style={{ padding: 0 }}
            />
          ) : (
            name
          )}
        </span>
      </>
    );

    const list = _.map(values, (value, idx: number) => (
      <DragableRow
        key={`${idx}`}
        index={idx}
        dragType={`resume-list-${key}`}
        moveRow={(oldIdx: number, newIdx: number) =>
          swapItems(key, oldIdx, newIdx)
        }
      >
        <div
          onClick={() => {
            setChildrenDrawer(key);
            updateCurrentContent({
              ...value,
              dataIndex: idx,
            });
          }}
        >
          {`${idx + 1}. ${Object.values(value || {}).join(' - ')}`}
        </div>
        <DeleteFilled
          onClick={event => {
            event.stopPropagation();
            Modal.confirm({
              content: intl.formatMessage({ id: '确认删除' }),
              onOk: () => deleteItem(key, idx),
            });
          }}
        />
      </DragableRow>
    ));

    return (
      <div className="module-item" key={`${idx}`}>
        <Collapse defaultActiveKey={[]} ghost>
          <Panel header={header} key={`${idx}`}>
            <div className="list-value-item">
              {list}
              <div
                className="btn-append"
                onClick={() => {
                  setChildrenDrawer(key);
                  updateCurrentContent(null);
                }}
              >
                <FormattedMessage id="继续添加" />
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  };
  // #endregion

  // #region 1.2 render: ModuleListItem when !_.endsWith(module.key,'List')
  const renderModuleListItem = ({ icon, key, name }: ModuleDefinition) => (
    <div className="module-item" key={key}>
      <Collapse
        defaultActiveKey={[]}
        ghost
        expandIcon={() => (
          <span style={{ display: 'inline-block', width: '12px' }} />
        )}
      >
        <Panel
          header={
            <span
              onClick={() => {
                updateCurrentContent(_.get(props.value, key));
                setChildrenDrawer(key);
              }}
            >
              <span className="item-icon">{icon}</span>
              <span className="item-name">{name}</span>
            </span>
          }
          className="no-content-panel"
          key="no-content-panel__renderModuleListItem"
        />
      </Collapse>
    </div>
  );
  // #endregion

  const moduleContent = (
    <DndProvider backend={HTML5Backend}>
      <div className="module-list">
        {modules.map((module, idx) => {
          if (!_.endsWith(module.key, 'List')) {
            return renderModuleListItem(module);
          }
          const values = _.get(props.value, module.key, []) as Array<
            Record<string, unknown>
          >;
          return renderModuleList(
            module as ModuleDefinition & { key: ListModuleKey },
            idx,
            values
          );
        })}
        <div className="custom-section-heading">
          <span>
            <FormattedMessage id="自定义模块" />
          </span>
          <Button
            size="small"
            type="link"
            icon={<PlusOutlined />}
            onClick={() => {
              setCustomSectionIndex(null);
              customSectionForm.resetFields();
              customSectionForm.setFieldsValue({
                items: [{}],
              } as CustomSection);
              setCustomSectionVisible(true);
            }}
          >
            <FormattedMessage id="新增模块" />
          </Button>
        </div>
        <div className="list-value-item custom-section-list">
          {(props.value?.customSections || []).map((section, index) => (
            <DragableRow
              key={section.id}
              index={index}
              dragType="custom-sections"
              moveRow={(oldIndex, newIndex) =>
                swapItems('customSections', oldIndex, newIndex)
              }
            >
              <div
                onClick={() => {
                  setCustomSectionIndex(index);
                  customSectionForm.setFieldsValue(_.cloneDeep(section));
                  setCustomSectionVisible(true);
                }}
              >
                {section.title}
              </div>
              <DeleteFilled
                onClick={event => {
                  event.stopPropagation();
                  Modal.confirm({
                    content: intl.formatMessage({ id: '确认删除' }),
                    onOk: () => deleteItem('customSections', index),
                  });
                }}
              />
            </DragableRow>
          ))}
        </div>
      </div>
      <AntdDrawer
        title={modules.find(m => m.key === childrenDrawer)?.name}
        width="min(450px, 100vw)"
        onClose={() => setChildrenDrawer(null)}
        visible={!!childrenDrawer}
      >
        <FormCreator
          config={
            contentOfModule[childrenDrawer as keyof typeof contentOfModule] ||
            []
          }
          value={currentContent}
          isList={isList}
          onChange={v => {
            if (isList) {
              const newValue = _.cloneDeep(
                _.get(props.value, childrenDrawer, [])
              ) as Array<Record<string, any>>;
              if (currentContent) {
                newValue[currentContent.dataIndex as number] = _.merge(
                  {},
                  _.omit(currentContent, 'dataIndex'),
                  v
                );
              } else {
                newValue.push(v);
              }
              props.onValueChange({
                [childrenDrawer]: newValue,
              });
              // 关闭抽屉
              setChildrenDrawer(null);
              // 清空当前选中内容
              updateCurrentContent(null);
            } else {
              updateContent(v);
            }
          }}
        />
      </AntdDrawer>
      <AntdDrawer
        title={intl.formatMessage({
          id: customSectionIndex === null ? '新增模块' : '编辑模块',
        })}
        width="min(450px, 100vw)"
        onClose={() => setCustomSectionVisible(false)}
        visible={customSectionVisible}
        destroyOnClose={false}
      >
        <Form
          form={customSectionForm}
          layout="vertical"
          onFinish={values => {
            const sections = _.cloneDeep(props.value.customSections || []);
            const section: CustomSection = {
              id:
                customSectionIndex === null
                  ? `custom-${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2, 8)}`
                  : sections[customSectionIndex].id,
              title: values.title,
              items: values.items || [],
            };
            if (customSectionIndex === null) sections.push(section);
            else sections[customSectionIndex] = section;
            props.onValueChange({ customSections: sections });
            setCustomSectionVisible(false);
          }}
        >
          <Form.Item
            name="title"
            label={intl.formatMessage({ id: '模块标题' })}
            rules={[{ required: true, whitespace: true }]}
          >
            <Input maxLength={60} />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div className="custom-section-form-item" key={field.key}>
                    <Space align="baseline">
                      <strong>{index + 1}</strong>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                    <Form.Item
                      {...field}
                      name={[field.name, 'title']}
                      fieldKey={[field.fieldKey, 'title']}
                      label={intl.formatMessage({ id: '条目标题' })}
                    >
                      <Input maxLength={100} />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'subtitle']}
                      fieldKey={[field.fieldKey, 'subtitle']}
                      label={intl.formatMessage({ id: '条目副标题' })}
                    >
                      <Input maxLength={100} />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'description']}
                      fieldKey={[field.fieldKey, 'description']}
                      label={intl.formatMessage({ id: '条目描述' })}
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 3 }}
                        maxLength={2000}
                      />
                    </Form.Item>
                  </div>
                ))}
                <Button
                  type="dashed"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                >
                  <FormattedMessage id="新增条目" />
                </Button>
              </>
            )}
          </Form.List>
          <Button
            className="custom-section-submit"
            type="primary"
            htmlType="submit"
            block
          >
            <FormattedMessage id="保存模块" />
          </Button>
        </Form>
      </AntdDrawer>
    </DndProvider>
  );

  // #endregion

  return (
    <>
      <Button
        type="primary"
        onClick={() => setVisible(true)}
        style={props.style}
      >
        <FormattedMessage id="进行配置" />
        <Popover
          content={
            <FormattedMessage id="手机和平板也可编辑，建议横屏获得更大空间" />
          }
        >
          <InfoCircleFilled style={{ marginLeft: '4px' }} />
        </Popover>
      </Button>
      <AntdDrawer
        title={
          <Radio.Group value={type} onChange={e => setType(e.target.value)}>
            <Radio.Button value="template">
              <FormattedMessage id="选择模板" />
            </Radio.Button>
            <Radio.Button value="module">
              <FormattedMessage id="配置简历" />
            </Radio.Button>
          </Radio.Group>
        }
        width="min(480px, 100vw)"
        closable={false}
        onClose={() => setVisible(false)}
        visible={visible}
      >
        {type === 'module' ? (
          moduleContent
        ) : (
          // type === 'theme'
          <>
            <ConfigTheme
              {...props.theme}
              onChange={v => props.onThemeChange(v)}
            />
            <Templates
              template={props.template}
              onChange={v => props.onTemplateChange(v)}
            />
          </>
        )}
      </AntdDrawer>
    </>
  );
};
