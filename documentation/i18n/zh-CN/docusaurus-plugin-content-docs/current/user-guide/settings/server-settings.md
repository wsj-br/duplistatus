# 服务器 {#server}

您可以在此处为服务器配置备用名称（别名）、用于描述其功能的备注以及 Duplicati 服务器的 Web 地址。

![server settings](../../assets/screen-settings-server.png)

| 设置                         | 描述                                                                                                                                                                                  |
|:--------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **服务器名称**                 | 在 Duplicati 服务器中配置的服务器名称。如果服务器设置了密码，将出现 <IIcon2 icon="lucide:key-round" color="#42A5F5"/>。                                         |
| **别名**                       | 服务器的昵称或易于阅读的名称。当悬停在别名上时，将显示其名称；在某些情况下，为了清晰起见，它将显示别名并在括号中显示名称。 |
| **备注**                        | 用于描述服务器功能、安装位置或任何其他信息的自由文本。配置后，它将显示在服务器的名称或别名旁边。                 |
| **Web 界面地址 (URL)** | 配置用于访问 Duplicati 服务器 UI 的 URL。支持 `HTTP` 和 `HTTPS` URL。                                                                                           |
| **状态**                      | 显示测试或采集备份日志的结果                                                                                                               |
| **操作**                     | 您可以进行测试、打开 Duplicati 界面、采集日志和设置密码，详情请参阅下文。                                                                                         |

<br/>

:::note
如果未配置 Web 界面地址 (URL)，<SvgIcon svgFilename="duplicati_logo.svg" /> 按钮
将在所有页面中被禁用，且该服务器将不会显示在 [Duplicati 配置](../duplicati-configuration.md) <SvgButton svgFilename="duplicati_logo.svg" href="../duplicati-configuration"/> 列表中。
:::

<br/>

## 每台服务器的可用操作 {#available-actions-for-each-server}

| 按钮                                                                                                      | 描述                                                             |
|:------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------|
| <IconButton icon="lucide:play" label="测试"/>                                                               | 测试与 Duplicati 服务器的连接。                            |
| <SvgButton svgFilename="duplicati_logo.svg" />                                                              | 在新的浏览器标签页中打开 Duplicati 服务器的 Web 界面。         |
| <IconButton icon="lucide:download" />                                                                       | 从 Duplicati 服务器采集备份日志。                          |
| <IconButton icon="lucide:rectangle-ellipsis" /> &nbsp; 或 <IIcon2 icon="lucide:key-round" color="#42A5F5"/> | 为 Duplicati 服务器更改或设置用于采集备份的密码。 |

<br/>

:::info[IMPORTANT]

为了保障您的安全，您只能执行以下操作：
- 为服务器设置密码
- 完全移除（删除）密码
 
密码以加密形式存储在数据库中，且从未在用户界面中显示。
:::

<br/>

## 所有服务器的可用操作 {#available-actions-for-all-servers}

| 按钮                                                     | 描述                                     |
|:-----------------------------------------------------------|:------------------------------------------------|
| <IconButton label="保存更改" />                        | 保存对服务器设置所做的更改。   |
| <IconButton icon="lucide:fast-forward" label="全部测试"/>  | 测试与所有 Duplicati 服务器的连接。   |
| <IconButton icon="lucide:import" label="全部采集 (#)"/> | 从所有 Duplicati 服务器采集备份日志。 |

<br/>
