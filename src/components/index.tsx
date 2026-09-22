import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  Button,
  Affix,
  Upload,
  Spin,
  message,
  Alert,
  Modal,
  Tooltip,
} from 'antd';
import { RedoOutlined, UndoOutlined, HistoryOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/lib/upload';
import _ from 'lodash-es';
import jsonUrl from 'json-url';
import { FormattedMessage, useIntl } from 'react-intl';
import { getLanguage } from '@/i18n';
import { useModeSwitcher } from '@/hooks/useModeSwitcher';
import { getDefaultTitleNameMap } from '@/data/constant';
import { getSearchObj } from '@/helpers/location';
import { customAssign } from '@/helpers/customAssign';
import { copyToClipboard } from '@/helpers/copy-to-board';
import { exportDataToLocal } from '@/helpers/export-to-local';
import { saveToLocalStorage } from '@/helpers/store-to-local';
import { loadEditableResume } from '@/helpers/load-resume';
import { fetchResume } from '@/helpers/fetch-resume';
import { Drawer } from './Drawer';
import { Resume } from './Resume';
import type { ResumeConfig, ResumeFile, ThemeConfig } from '@/types/resume';
import { SITE_OWNER } from '@/data/site';
import { RESUME_INFO } from '@/data/resume';
import {
  parseResumeFile,
  ResumeValidationError,
  splitResumeFile,
  validateResumeConfig,
} from '@/helpers/resume-schema';

import './index.less';

const codec = jsonUrl('lzma');
const DEFAULT_THEME: ThemeConfig = {
  color: '#2f5785',
  tagColor: '#8bc34a',
};

type EditorSnapshot = { config: ResumeConfig; theme: ThemeConfig };
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const Page: React.FC = () => {
  const lang = getLanguage();
  const intl = useIntl();
  const user = String(getSearchObj().user || SITE_OWNER);
  const draftUser = String(getSearchObj().user || '');

  const [, mode, changeMode] = useModeSwitcher({});

  const originalConfig = useRef<ResumeConfig>();
  const query = getSearchObj();
  const requestedTemplate = Array.isArray(query.template)
    ? query.template[0]
    : query.template || 'template1';
  const [config, setConfig] = useState<ResumeConfig>();
  const [loading, updateLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [revision, setRevision] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number>();
  const [restoredDraft, setRestoredDraft] = useState(false);
  const past = useRef<EditorSnapshot[]>([]);
  const future = useRef<EditorSnapshot[]>([]);

  useEffect(() => {
    if (!config || query.template) return;
    const url = new URL(window.location.href);
    url.searchParams.set('template', config.template || 'template1');
    window.history.replaceState({}, '', url.toString());
  }, [config, query.template]);

  const updateTemplate = (value: string) => {
    if (!config) return;
    commitSnapshot({ config: { ...config, template: value }, theme });
    const url = new URL(window.location.href);
    url.searchParams.set('template', value);
    window.history.replaceState({}, '', url.toString());
  };

  const changeConfig = (value: ResumeConfig) => {
    setConfig({
      ...value,
      titleNameMap: {
        ...getDefaultTitleNameMap({ intl }),
        ...value.titleNameMap,
      },
    });
  };

  useEffect(() => {
    const user = (query.user || '') as string;
    const branch = (query.branch || 'master') as string;
    const mode = query.mode;

    function store(
      data: ResumeConfig,
      options?: { theme?: ThemeConfig; source?: string; savedAt?: number }
    ) {
      originalConfig.current = data;
      const localizedConfig = customAssign(
        { ...data },
        _.get(data, ['locales', lang])
      );
      delete localizedConfig.locales;
      changeConfig({
        ...localizedConfig,
        template:
          typeof query.template === 'string'
            ? query.template
            : localizedConfig.template,
      });
      if (options?.theme) setTheme(options.theme);
      if (options?.source === 'draft') {
        setRestoredDraft(true);
        setLastSavedAt(options.savedAt);
        setSaveStatus('saved');
      }
      past.current = [];
      future.current = [];
      updateLoading(false);
    }

    if (!mode) {
      const link = `https://github.com/${user}/${user}/tree/${branch}`;
      fetchResume(lang, branch, user)
        .then(data => store(data))
        .catch(() => {
          Modal.info({
            title: <FormattedMessage id="获取简历信息失败" />,
            content: (
              <div>
                请检查用户名 {user} 是否正确或者简历信息是否在
                <a href={link} target="_blank">{`${link}/resume.json`}</a>下
              </div>
            ),
            okText: <FormattedMessage id="进入在线编辑" />, // intl.formatMessage({ id: '进入在线编辑' }),
            onOk: () => {
              changeMode('edit');
            },
          });
        });
    } else {
      if (typeof query.data === 'string') {
        codec
          .decompress(query.data)
          .then(data => store(validateResumeConfig(JSON.parse(data))))
          .catch(() => {
            message.error(
              intl.formatMessage({ id: '上传文件有误，请重新上传' })
            );
            updateLoading(false);
          });
      } else {
        loadEditableResume(lang, branch, user).then(result => {
          store(result.resume, result);
        });
      }
    }
  }, [lang, query.user, query.branch, query.data]);

  const commitSnapshot = useCallback(
    (next: EditorSnapshot) => {
      if (!config) return;
      const current = { config, theme };
      if (_.isEqual(current, next)) return;
      past.current = [...past.current.slice(-49), _.cloneDeep(current)];
      future.current = [];
      changeConfig(next.config);
      setTheme(next.theme);
      setRestoredDraft(false);
      setSaveStatus('saving');
      setRevision(value => value + 1);
    },
    [config, theme]
  );

  const onConfigChange = useCallback(
    (v: Partial<ResumeConfig>) => {
      if (!config) return;
      commitSnapshot({ config: { ...config, ...v }, theme });
    },
    [commitSnapshot, config, theme]
  );

  const onThemeChange = useCallback(
    (v: Partial<ThemeConfig>) => {
      if (!config) return;
      commitSnapshot({ config, theme: _.assign({}, theme, v) });
    },
    [commitSnapshot, config, theme]
  );

  const applyHistory = useCallback(
    (direction: 'undo' | 'redo') => {
      if (!config) return;
      const source = direction === 'undo' ? past : future;
      const target = direction === 'undo' ? future : past;
      const snapshot = source.current[source.current.length - 1];
      if (!snapshot) return;
      source.current = source.current.slice(0, -1);
      target.current = [
        ...target.current.slice(-49),
        _.cloneDeep({ config, theme }),
      ];
      changeConfig(snapshot.config);
      setTheme(snapshot.theme);
      setRestoredDraft(false);
      setSaveStatus('saving');
      setRevision(value => value + 1);
    },
    [config, theme]
  );

  useEffect(() => {
    if (mode !== 'edit' || !config || revision === 0) return;
    const timer = window.setTimeout(() => {
      try {
        const savedAt = saveToLocalStorage(draftUser, getResumeFile());
        setLastSavedAt(savedAt);
        setSaveStatus('saved');
      } catch (_error) {
        setSaveStatus('error');
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [config, draftUser, mode, revision, theme]);

  useEffect(() => {
    if (mode !== 'edit' || !config) return;
    const saveBeforeLeaving = () => {
      if (revision > 0) {
        try {
          saveToLocalStorage(draftUser, getResumeFile());
        } catch (_error) {
          // beforeunload 会在保存失败时继续向用户发出离开警告。
        }
      }
    };
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (saveStatus !== 'error') return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('pagehide', saveBeforeLeaving);
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => {
      window.removeEventListener('pagehide', saveBeforeLeaving);
      window.removeEventListener('beforeunload', warnBeforeLeaving);
    };
  }, [config, draftUser, mode, revision, saveStatus, theme]);

  useEffect(() => {
    if (mode !== 'edit') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== 'z'
      ) {
        return;
      }
      event.preventDefault();
      applyHistory(event.shiftKey ? 'redo' : 'undo');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applyHistory, mode]);

  const [box, setBox] = useState({ width: 0, height: 0, left: 0 });

  useEffect(() => {
    const targetNode = document.querySelector('.resume-content');
    if (!targetNode) return;

    const observer = new MutationObserver(() => {
      setBox(targetNode.getBoundingClientRect());
    });
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // 再加一个定时器，监控下变化
    const interval = setInterval(() => {
      setBox(targetNode.getBoundingClientRect());
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const importConfig = (file: RcFile) => {
    if (window.FileReader) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (typeof reader.result === 'string') {
            const { resume, theme: importedTheme } = splitResumeFile(
              parseResumeFile(reader.result)
            );
            originalConfig.current = resume;
            commitSnapshot({
              config: resume,
              theme: importedTheme || theme,
            });
          }
          message.success(intl.formatMessage({ id: '上传配置已应用' }));
        } catch (error) {
          message.error(
            error instanceof ResumeValidationError
              ? error.message
              : intl.formatMessage({ id: '上传文件有误，请重新上传' })
          );
        }
      };
      reader.readAsText(file);
    } else {
      message.error(
        intl.formatMessage({
          id: '您当前浏览器不支持 FileReader，建议使用谷歌浏览器',
        })
      );
    }
    return false;
  };

  function getResumeFile(): ResumeFile {
    if (!config) {
      throw new Error('简历数据尚未加载');
    }
    let fullConfig: ResumeConfig = config;
    if (lang !== 'zh-CN') {
      const baseConfig = originalConfig.current || config;
      fullConfig = customAssign(
        { ...baseConfig },
        {
          locales: {
            ...baseConfig.locales,
            [lang]: _.omit(config, ['schemaVersion', 'locales']),
          },
        }
      );
    }
    return { ...fullConfig, theme };
  }

  function getConfigJson() {
    return JSON.stringify(getResumeFile());
  }

  const copyConfig = () => {
    copyToClipboard(getConfigJson());
  };

  const exportConfig = () => {
    exportDataToLocal(getConfigJson(), `${user}'s resume info`);
  };

  const handleSharing = () => {
    const fullConfig = getConfigJson();
    codec.compress(fullConfig).then(data => {
      const url = new URL(window.location.href);
      url.searchParams.set('data', data);

      console.log('sharing url', url.toString());
      copyToClipboard(url.toString());
    });
  };

  const restoreDefaults = () => {
    if (!config) return;
    Modal.confirm({
      title: intl.formatMessage({ id: '恢复默认内容' }),
      content: intl.formatMessage({
        id: '这会用内置示例替换当前简历，之后仍可撤销。',
      }),
      okText: intl.formatMessage({ id: '确定恢复' }),
      okButtonProps: { danger: true },
      onOk: () => {
        const defaultConfig = validateResumeConfig(_.cloneDeep(RESUME_INFO));
        originalConfig.current = defaultConfig;
        commitSnapshot({ config: defaultConfig, theme: DEFAULT_THEME });
        const url = new URL(window.location.href);
        url.searchParams.set('template', defaultConfig.template || 'template1');
        window.history.replaceState({}, '', url.toString());
      },
    });
  };

  const saveStatusText = (() => {
    if (saveStatus === 'saving') return intl.formatMessage({ id: '正在保存' });
    if (saveStatus === 'error') return intl.formatMessage({ id: '保存失败' });
    if (lastSavedAt) {
      return intl.formatMessage(
        { id: '最近保存时间：{time}' },
        {
          time: new Date(lastSavedAt).toLocaleTimeString(
            lang === 'zh-CN' ? 'zh-CN' : 'en-US',
            { hour: '2-digit', minute: '2-digit', second: '2-digit' }
          ),
        }
      );
    }
    return intl.formatMessage({ id: '尚未修改' });
  })();

  return (
    <React.Fragment>
      <Spin spinning={loading}>
        {mode === 'edit' && (
          <Alert
            showIcon={false}
            message={
              <span>
                {intl.formatMessage({
                  id: `编辑之后，请及时存储个人信息到个人仓库中。`,
                })}
                <span>
                  <span style={{ marginRight: '4px' }}>
                    👉 {!query.user && intl.formatMessage({ id: '参考：' })}
                  </span>
                  <span
                    style={{
                      color: `var(--primary-color, #1890ff)`,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      const user = query.user || SITE_OWNER;
                      window.open(`https://github.com/${user}/${user}`);
                    }}
                  >
                    {`${query.user || SITE_OWNER}'s resumeInfo`}
                  </span>
                  <span>
                    {`（https://github.com/${query.user || SITE_OWNER}/${
                      query.user || SITE_OWNER
                    }/blob/${query.branch || 'master'}/resume.json）`}
                  </span>
                </span>
              </span>
            }
            banner
            closable
          />
        )}
        <div className="page">
          {config && (
            <Resume
              value={config}
              theme={theme}
              template={config.template || requestedTemplate}
            />
          )}
          {mode === 'edit' && config && (
            <React.Fragment>
              <Affix offsetTop={0}>
                <Button.Group className="btn-group">
                  <Drawer
                    value={config}
                    onValueChange={onConfigChange}
                    theme={theme}
                    onThemeChange={onThemeChange}
                    template={config?.template || requestedTemplate}
                    onTemplateChange={updateTemplate}
                  />
                  <Tooltip
                    title={intl.formatMessage({ id: '撤销（Ctrl/Cmd + Z）' })}
                  >
                    <Button
                      aria-label={intl.formatMessage({ id: '撤销' })}
                      icon={<UndoOutlined />}
                      disabled={past.current.length === 0}
                      onClick={() => applyHistory('undo')}
                    >
                      <FormattedMessage id="撤销" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={intl.formatMessage({
                      id: '重做（Ctrl/Cmd + Shift + Z）',
                    })}
                  >
                    <Button
                      aria-label={intl.formatMessage({ id: '重做' })}
                      icon={<RedoOutlined />}
                      disabled={future.current.length === 0}
                      onClick={() => applyHistory('redo')}
                    >
                      <FormattedMessage id="重做" />
                    </Button>
                  </Tooltip>
                  <Button type="primary" onClick={copyConfig}>
                    <FormattedMessage id="复制配置" />
                  </Button>
                  <Button type="primary" onClick={exportConfig}>
                    <FormattedMessage id="保存简历" />
                  </Button>
                  <Upload
                    accept=".json"
                    showUploadList={false}
                    beforeUpload={importConfig}
                  >
                    <Button className="btn-upload">
                      <FormattedMessage id="导入配置" />
                    </Button>
                  </Upload>
                  <Button type="primary" onClick={() => window.print()}>
                    <FormattedMessage id="下载 PDF" />
                  </Button>
                  <Button type="primary" onClick={handleSharing}>
                    <FormattedMessage id="分享" />
                  </Button>
                  <Button danger onClick={restoreDefaults}>
                    <FormattedMessage id="恢复默认内容" />
                  </Button>
                  <Button
                    className={`save-status save-status-${saveStatus}`}
                    icon={<HistoryOutlined />}
                    disabled
                  >
                    {restoredDraft && saveStatus === 'saved'
                      ? intl.formatMessage({ id: '已恢复草稿' })
                      : saveStatusText}
                  </Button>
                </Button.Group>
              </Affix>
              <div
                className="box-size-info"
                style={{
                  top: `${box.height + 4}px`,
                  left: `${box.width + box.left}px`,
                }}
              >
                ({box.width}, {box.height})
              </div>
            </React.Fragment>
          )}
        </div>
      </Spin>
    </React.Fragment>
  );
};

export default Page;
