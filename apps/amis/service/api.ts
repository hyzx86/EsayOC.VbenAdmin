import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import authService, { globConfig } from './../route/auth/authService';




enum DynamicFilterOperator {
  /// <summary>
  /// like
  /// </summary>
  Contains = "Contains",
  StartsWith = "StartsWith",
  EndsWith = "EndsWith",
  NotContains = "NotContains",
  NotStartsWith = "NotStartsWith",
  NotEndsWith = "NotEndsWith",

  /// <summary>
  /// =<para></para>
  /// Equal/Equals/Eq 效果相同
  /// </summary>
  Equal = "Equal",
  /// <summary>
  /// =<para></para>
  /// Equal/Equals/Eq 效果相同
  /// </summary>
  Equals = "Equals",
  /// <summary>
  /// =<para></para>
  /// Equal/Equals/Eq 效果相同
  /// </summary>
  Eq = "Eq",
  /// <summary>
  /// &lt;&gt;
  /// </summary>
  NotEqual = "NotEqual",

  /// <summary>
  /// &gt;
  /// </summary>
  GreaterThan = "GreaterThan",
  /// <summary>
  /// &gt;=
  /// </summary>
  GreaterThanOrEqual = "GreaterThanOrEqual",
  /// <summary>
  /// &lt;
  /// </summary>
  LessThan = "LessThan",
  /// <summary>
  /// &lt;=
  /// </summary>
  LessThanOrEqual = "LessThanOrEqual",

  /// <summary>
  /// &gt;= and &lt;<para></para>
  /// 此时 Value 的值格式为逗号分割：value1,value2 或者数组
  /// </summary>
  Range = "Range",

  /// <summary>
  /// &gt;= and &lt;<para></para>
  /// 此时 Value 的值格式为逗号分割：date1,date2 或者数组<para></para>
  /// 这是专门为日期范围查询定制的操作符，它会处理 date2 + 1，比如：<para></para>
  /// 当 date2 选择的是 2020-05-30，那查询的时候是 &lt; 2020-05-31<para></para>
  /// 当 date2 选择的是 2020-05，那查询的时候是 &lt; 2020-06<para></para>
  /// 当 date2 选择的是 2020，那查询的时候是 &lt; 2021<para></para>
  /// 当 date2 选择的是 2020-05-30 12，那查询的时候是 &lt; 2020-05-30 13<para></para>
  /// 当 date2 选择的是 2020-05-30 12:30，那查询的时候是 &lt; 2020-05-30 12:31<para></para>
  /// 并且 date2 只支持以上 5 种格式 (date1 没有限制)
  /// </summary>
  DateRange = "DateRange",

  /// <summary>
  /// in (1,2,3)<para></para>
  /// 此时 Value 的值格式为逗号分割：value1,value2,value3... 或者数组
  /// </summary>
  Any = "Any",
  /// <summary>
  /// not in (1,2,3)<para></para>
  /// 此时 Value 的值格式为逗号分割：value1,value2,value3... 或者数组
  /// </summary>
  NotAny = "NotAny",

  /// <summary>
  /// 自定义解析，此时 Field 为反射信息，Value 为静态方法的参数(string)<para></para>
  /// 示范：{ Operator: "Custom", Field: "RawSql webapp1.DynamicFilterCustom,webapp1", Value: "(id,name) in ((1,'k'),(2,'m'))" }<para></para>
  /// 注意：使用者自己承担【注入风险】<para></para>
  /// 静态方法定义示范：<para></para>
  /// namespace webapp1<para></para>
  /// {<para></para>
  /// public class DynamicFilterCustom<para></para>
  /// {<para></para>
  /// [DynamicFilterCustom]<para></para>
  /// public static string RawSql(object sender, string value) => value;<para></para>
  /// }<para></para>
  /// }<para></para>
  /// </summary>
  // Custom
}
enum DynamicFilterLogic { And = "And", Or = "Or" }

export class DynamicFilterInfo {
  field?: string
  operator?: DynamicFilterOperator
  value?: any
  logic?: DynamicFilterLogic
  filters?: DynamicFilterInfo[] = []
}

function convertToJSONFilter(condition: any): DynamicFilterInfo[] {
  const arr: DynamicFilterInfo[] = condition.map((child: any) => {
    const filterItem = {
      logic: child.conjunction,
      filters: []
    } as DynamicFilterInfo
    if (child.left && child.left.field && !child.children || child.children.length == 0) {
      // 如果子节点有left、op和right, 则转换为graphql形式的filter,否则返回空字符串
      if (child.left && child.op && child.right) {
        const props = { field: child.left.field, operator: child.op, value: child.right };
        switch (props.operator) {
          case 'between':
            filterItem.operator = DynamicFilterOperator.Range
            break
          case 'select_any_in':
            filterItem.operator = DynamicFilterOperator.Any
            break
          case 'select_not_any_in':
            filterItem.operator = DynamicFilterOperator.NotAny
            break
          default:
            {
              //@ts-ignore
              const targetKey = filterItem.operator?.replaceAll("_", "").toLowerCase() as string
              for (const key in DynamicFilterOperator) {
                if (targetKey == (key.toLowerCase())) {
                  //@ts-ignore
                  filterItem.operator = DynamicFilterOperator[key]
                  break
                }
              }
            }
        }
        filterItem.field = props.field;
        filterItem.value = props.value;
        // let filterStringJoin = '';
        // for (const key in props) {
        //   if (filterStringJoin) {
        //     filterStringJoin = filterStringJoin + ","
        //   }
        //   if (key === "field" || key === "value") {
        //     filterStringJoin = filterStringJoin + key + ':"' + props[key] + '"'
        //   }
        //   else if (key === "operator") {
        //     filterStringJoin = filterStringJoin + key + ':' + props[key] + '';
        //   } else {
        //     console.error("filter[item]: ", props, key)
        //     return "{}";
        //   }
        // }
        // return "{" + filterStringJoin + "}";
      }

    } else if (child.children && child.children.length > 0) {
      // 如果有子节点, 则转换为graphql形式的filter
      filterItem.filters = convertToJSONFilter(child.children);
    }
    return filterItem
  });
  return arr
}

//@ts-ignore 
function convertToGraphqlJSONFilter(condition: any) {

  let dynamicFilter = {
    filters: []
  } as DynamicFilterInfo;
  // 如果有子节点, 则转换为DynamicFilter形式的filter
  if (condition?.children?.length > 0) {
    const children = condition.children;
    // 利用递归将筛选转换为graphql形式的filter字符串
    const mapResult = convertToJSONFilter(children);
    if (mapResult)
      if (mapResult?.length > 1) {
        //@ts-ignore
        dynamicFilter.logic = condition.conjunction;
        dynamicFilter.filters = mapResult;
      } else {
        dynamicFilter = mapResult[0];
      }
  }

  return JSON.stringify(dynamicFilter)

}


//@ts-ignore
window.amisExt = {
  convertToGraphqlJSONFilter,
  convertCondition: function (condition: any) {
    console.log(condition, "convertCondition")
    let filterString = "";
    // 如果有子节点, 则转换为graphql形式的filter
    if (condition && condition.children && condition.children.length > 0) {
      const children = condition.children;
      // 利用递归将筛选转换为graphql形式的filter字符串
      filterString = "{" + "logic:" + condition.conjunction + "," + "filters:" + genGraphqlFilter(children) + "}";
    }

    if (filterString) {
      return filterString;

    } else {
      return JSON.stringify({})
    }
  }
}

function genGraphqlFilter(children: any) {
  const arr = children.map((child: any) => {
    if (child.left && child.left.field) {
      // 如果子节点有left、op和right, 则转换为graphql形式的filter,否则返回空字符串
      if (child.left && child.op && child.right) {
        const filter = { field: child.left.field, operator: child.op, value: child.right };

        switch (filter.operator) {
          case 'between':
            filter.operator = "RANGE"
            break
          case 'select_any_in':
            filter.operator = "ANY"
            break
          case 'select_not_any_in':
            filter.operator = "NOT_ANY"
            break
        }

        let filterStringJoin = '';
        for (const item in filter) {
          if (filterStringJoin) {
            filterStringJoin = filterStringJoin + ","
          }
          if (item === "field" || item === "value") {
            filterStringJoin = filterStringJoin + item + ':"' + filter[item] + '"'
          }
          else if (item === "operator") {
            filterStringJoin = filterStringJoin + item + ':' + filter[item] + '';
          } else {
            console.error("filter[item]: ", filter, item)
            return "{}";
          }
        }
        return "{" + filterStringJoin + "}";

      } else {
        return "{}";
      }
    } else if (child.children && child.children.length > 0) {
      // 如果有子节点, 则转换为graphql形式的filter
      const genChilds = genGraphqlFilter(child.children)
      if (genChilds === "[]") {
        return "{}"
      } else {
        return "{" + "logic:" + child.conjunction + ",filters:" + genChilds + "}";
      }
    } else {
      return "{}";
    }
  }).filter((item: any) => item !== "{}");

  // 如果数组为空, 则返回空数组字符串
  if (arr.length > 0) {
    return arr.join(",");

  } else {
    return '';
  }
}


export async function apiRequest(config: AxiosRequestConfig | boolean | any) {
  if (!config) {
    return { data: null };
  }
  console.log('config: ', config);
  const { url, method, data } = config;
  console.log('url: ', url);
  const apiBaseUrl = globConfig.serverRoot;//window.localStorage.getItem('apiUrl');
  console.log('apiurl', apiBaseUrl);

  config = config || {};
  config.baseURL = apiBaseUrl || '';
  config.headers = config.headers || {};
  const token = await authService.getAccessToken();
  // console.log('token: ', token);
  // console.log('timeout: ', timeout);
  if (!token) {
    if (config.needReload) {
      window.localStorage.setItem("needReload", "1")
      window.localStorage.setItem("returnUrl", window.location.href)
      await authService.login()
    } else {
      window.open('/auth/login');
      // await authService.signinPopup();
      window.alert('会话超时,请在新窗口中登陆后继续操作');
    }
    return;
  }
  config.headers.Authorization = 'Bearer ' + token;
  // config.headers['Content-Type'] = 'application/json'; 
  if (method !== 'post' && method !== 'put' && method !== 'patch') {
    if (data) {
      config.params = data;
    }
    // return axiosInstance.request({url,method,data });
  } else if (data && data instanceof FormData) {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'multipart/form-data';
  } else if (data && typeof data !== 'string' && !(data instanceof Blob) && !(data instanceof ArrayBuffer)) {
    config.data = JSON.stringify(data);
    config.headers['Content-Type'] = 'application/json';
  }

  const axiosInstance: AxiosInstance = axios.create(config);
  const result = await axiosInstance(config);
  console.log('axiosInstance:result ', result);
  if (config.url?.toLocaleLowerCase().startsWith('/api/graphql')) {
    console.log('graphql result', result);
    const finalResult = {
      data: result.data.data,
      status: result.status == 200 ? 0 : result.status,
      msg: result.statusText
    };
    console.log('graphql finalResult', finalResult);
    return finalResult;
  } else {
    console.log('defaultRequest result ', result);
    const finalResult = {
      ...result.data,
      // data: result.data.data
    };
    console.log('defaultRequest finalResult', finalResult);
    return finalResult;
  }
}
