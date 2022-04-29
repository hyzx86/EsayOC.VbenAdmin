import { getGlobalConfig } from '@/internal/config'
const globConfig = getGlobalConfig();

const schema ={
  "type": "page",
  "regions": [
    "body",
    "toolbar",
    "header"
  ],
  "title": "动态页管理",
  "body": [
    {
      "type": "crud",
      "api": {
        "method": "post",
        "url": "/api/graphql",
        "data": {
          "&": "$$"
        },
        "dataType": "json",
        "requestAdaptor": "\r\nconsole.log(\"api.发送适配器\",api)\r\nconst filterParams=[`status: ${api.data.status}`]\r\nif(api.data.displayText){\r\n     filterParams.push(`where: {displayText_contains: \"${api.data.displayText}\"}`)\r\n}\r\nif(api.data.orderBy){\r\n    filterParams.push(`orderBy:{${api.body.orderBy}:${api.body.orderDir.toUpperCase()}}`)\r\n}\r\nconsole.log(\"filterParams.join(',')\",filterParams.join(','))\r\nconst  query=`\r\n    {   items: amisSchema(\r\n        ${filterParams.join(',')}\r\n        )\r\n         {contentItemVersionId displayText   \r\n           createdUtc\r\n           contentItemId\r\n    latest\r\n           published\r\n           publishedUtc\r\n           modifiedUtc\r\n           author\r\n        } \r\n    }\r\n    ` \r\napi.data={query}\r\nconsole.log(\"api.发送适配器2\",api)\r\nreturn api"
      },
      "columns": [
        {
          "name": "displayText",
          "label": "名称",
          "placeholder": "-",
          "sortable": true,
          "popOver": false,
          "quickEdit": false,
          "inline": true,
          "type": "text"
        },
        {
          "type": "status",
          "name": "published",
          "label": "已发布"
        },
        {
          "type": "date",
          "label": "发布时间",
          "name": "publishedUtc",
          "placeholder": "-",
          "sortable": true
        },
        {
          "type": "date",
          "label": "修改时间",
          "name": "modifiedUtc",
          "placeholder": "-",
          "sortable": true
        },
        {
          "name": "createdUtc",
          "label": "创建时间",
          "type": "date",
          "placeholder": "-",
          "sortable": true
        },
        {
          "type": "text",
          "name": "author",
          "label": "创建人",
          "placeholder": "-",
          "sortable": true
        },
        {
          "type": "operation",
          "label": "操作",
          "buttons": [
            {
              "label": "编辑",
              "type": "button",
              "actionType": "dialog",
              "level": "link",
              "dialog": {
                "type": "dialog",
                "title": "编辑",
                "body": [
                  {
                    "type": "property",
                    "id": "u:1577f3084cdd",
                    "title": "",
                    "items": [
                      {
                        "label": "编号",
                        "content": "${contentItemId}",
                        "span": 1
                      },
                      {
                        "label": "版本号",
                        "content": "${contentItemVersionId}",
                        "span": 1
                      },
                      {
                        "label": "创建人",
                        "content": "${author}",
                        "span": 1
                      },
                      {
                        "label": "创建时间",
                        "content": "${createdUtc}",
                        "span": 1
                      },
                      {
                        "span": 1,
                        "label": "修改时间",
                        "content": "${modifiedUtc}"
                      },
                      {
                        "span": 1,
                        "label": "发布时间",
                        "content": "${publishedUtc}"
                      },
                      {
                        "span": 1,
                        "label": "最新版本",
                        "content": "${latest?\"是\":\"否\"}"
                      }
                    ],
                    "column": 3,
                    "mode": "table",
                    "closeOnEsc": false,
                    "closeOnOutside": false,
                    "showCloseButton": true,
                    "className": "m-b-md"
                  },
                  {
                    "type": "form",
                    "api": {
                      "method": "post",
                      "url": "/api/ContentManagement/PostContent",
                      "dataType": "json"
                    },
                    "body": [
                      {
                        "name": "contentType",
                        "label": "ContentType",
                        "type": "hidden",
                        "value": "AmisSchema"
                      },
                      {
                        "type": "hidden",
                        "label": "contentItemId",
                        "name": "contentItemId"
                      },
                      {
                        "type": "input-text",
                        "label": "名称",
                        "name": "displayText",
                        "required": true
                      },
                      {
                        "type": "switch",
                        "label": "发布状态",
                        "name": "published",
                        "option": "",
                        "id": "u:079f8569c6bd",
                        "optionAtLeft": false,
                        "trueValue": true,
                        "falseValue": false,
                        "onText": "已发布",
                        "offText": "未发布"
                      },
                      {
                        "type": "textarea",
                        "label": "描述",
                        "name": "description"
                      },
                      {
                        "type": "textarea",
                        "label": "JSON Schema",
                        "name": "schema",
                        "language": "json",
                        "minRows": 3,
                        "maxRows": 20,
                        "minLength": 5,
                        "maxLength": "",
                        "showCounter": true,
                        "mode": "",
                        "inline": false
                      }
                    ],
                    "initApi": {
                      "method": "get",
                      "url": "/api/graphql?query={  contentItem(contentItemId: \"${contentItemId}\") {     ... on AmisSchema {      createdUtc       description       displayText     schema       contentItemId       contentType       latest owner published       contentItemVersionId     }   } }",
                      "data": null,
                      "dataType": "json",
                      "replaceData": true,
                      "onPreRequest": "",
                      "responseData": null,
                      "adaptor": "console.log(response,'responseresponseresponse') \n return {data:response.data.contentItem}",
                      "sendOn": "!!this.contentItemId"
                    },
                    "name": "EditForm",
                    "actions": [
                    ]
                  }
                ],
                "closeOnEsc": true,
                "closeOnOutside": false,
                "showCloseButton": true,
                "size": "xl",
                "data": null
              },
              "onClick": "console.log(props,'Editing')"
            },
            {
              "label": "预览",
              "type": "button",
              "actionType": "url",
              "level": "link",
              "url": "/amis/adv/${displayText}",
              "disabledOn": "!this.latest",
              "blank": false,
              "id": "u:bfd10d15009c",
              "placeholder": "-"
            },
            {
              "type": "button",
              "label": "设计器",
              "actionType": "",
              "level": "link",
              "onClick": "window.open(`"+ globConfig.amisEditorUrl +"index.html#/edit/${props.data.contentItemId}`)",
              "disabledOn": "!this.latest",
              "perPageAvailable": [
                10
              ]
            },
            {
              "type": "button",
              "label": "复制",
              "actionType": "dialog",
              "level": "link",
              "dialog": {
                "title": "系统提示",
                "body": "对你点击了"
              },
              "id": "u:86d05e9edaa7",
              "placeholder": "-"
            },
            {
              "type": "button",
              "label": "删除",
              "actionType": "ajax",
              "level": "link",
              "className": "text-danger",
              "confirmText": "确定要删除？",
              "api": {
                "method": "delete",
                "url": "/api/content/${contentItemId}"
              },
              "onClick": "console.log(props)",
              "disabledOn": "!this.latest"
            }
          ]
        }
      ],
      "bulkActions": [
      ],
      "itemActions": [
      ],
      "features": [
        "filter",
        "create",
        "update",
        "view",
        "delete"
      ],
      "headerToolbar": [
        {
          "label": "新增",
          "type": "button",
          "actionType": "dialog",
          "level": "primary",
          "dialog": {
            "title": "编辑",
            "body": [
              {
                "type": "form",
                "api": {
                  "method": "post",
                  "url": "/api/ContentManagement/PostContent?draft=true",
                  "dataType": "json"
                },
                "body": [
                  {
                    "name": "contentType",
                    "label": "ContentType",
                    "type": "hidden",
                    "value": "AmisSchema"
                  },
                  {
                    "type": "input-text",
                    "label": "名称",
                    "name": "displayText",
                    "required": true
                  },
                  {
                    "type": "textarea",
                    "label": "描述",
                    "name": "description"
                  },
                  {
                    "type": "textarea",
                    "label": "JSON Schema",
                    "name": "schema",
                    "language": "json",
                    "minRows": 3,
                    "maxRows": 20,
                    "minLength": 5,
                    "maxLength": "",
                    "showCounter": true,
                    "mode": "",
                    "inline": false
                  }
                ],
                "initApi": "",
                "name": "EditForm",
                "actions": [
                ]
              }
            ],
            "type": "dialog",
            "closeOnEsc": true,
            "closeOnOutside": false,
            "showCloseButton": true,
            "size": "xl",
            "data": null
          }
        },
        "bulkActions"
      ],
      "perPageAvailable": [
        10
      ],
      "messages": {
      },
      "primaryField": "contentItemId",
      "filter": {
        "title": "查询条件",
        "body": [
          {
            "type": "input-text",
            "name": "displayText",
            "label": "名称",
            "size": "lg"
          },
          {
            "type": "select",
            "label": "状态",
            "name": "status",
            "options": [
              {
                "label": "只看最新版",
                "value": "LATEST"
              },
              {
                "label": "所有发布版",
                "value": "PUBLISHED"
              },
              {
                "label": "所有草稿",
                "value": "DRAFT"
              }
            ],
            "id": "u:b1a90587336d",
            "perPageAvailable": [
              10
            ],
            "checkAll": false,
            "value": "LATEST",
            "searchable": false,
            "size": "md"
          }
        ],
        "checkAll": false,
        "submitOnChange": true,
        "perPageAvailable": [
          10
        ],
        "mode": "inline",
        "panelClassName": ""
      },
      "keepItemSelectionOnPageChange": true,
      "labelTpl": "${displayText}",
      "filterTogglable": true,
      "footerToolbar": [
        {
          "type": "statistics"
        },
        {
          "type": "pagination"
        },
        {
          "type": "load-more",
          "tpl": "内容",
          "align": "right"
        }
      ],
      "filterColumnCount": 3
    },
    {
      "type": "button",
      "label": "测试Amis按钮触发Vben事件处理",
      "actionType": "",
      "id": "u:cd65046ddfd3"
    }
  ],
  "definitions": {
  },
  "messages": {
  },
  "style": {
  }
}


export default schema