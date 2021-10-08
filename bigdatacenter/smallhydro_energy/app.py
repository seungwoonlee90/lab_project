import os
import pandas as pd
import requests
from datetime import datetime

apiKey = os.environ.get("SECURE")
year = datetime.today().year

obscds =[]
for j in range(1,6) :
    url = f'http://www.wamis.go.kr:8080/wamis/openapi/wkw/wl_dubwlobs?basin={j}&oper=y&output=json&key={apiKey}'
    res = requests.get(url)
    data = res.json()

    for i in range(data['count']) :
        obscds.append([data['list'][i]['obscd'], data['list'][i]['obsnm'], data['list'][i]['sbsncd'],
                     data['list'][i]['mngorg']])

obscd_df = pd.DataFrame(obscds, columns= ['obscd', 'obsnm', 'sbsncd', 'mngorg'])
obscds = obscd_df['obscd'].to_list()

df = []

for obscd in obscds :
    url = f'http://www.wamis.go.kr:8080/wamis/openapi/wkw/flw_dtdata?obscd={obscd}&year=2021&output=json&key={apiKey}'
    res = requests.get(url)
    data = res.json()
    if data['count'] != 0 :
        df.append([obscd, data['list'][-1]['ymd'], data['list'][-1]['fw']])
    else :
        pass
    
print('수집 완료')

df = pd.DataFrame(df, columns= ['obscd', 'ymd', 'fw'])
res = pd.merge(obscd_df, df, on='obscd', how='outer')
res = res.fillna('-999')
res['fw'] = res['fw'].apply(lambda x : '-999' if (x == '-') else x)
res['fw'] = res['fw'].astype(float)

with open('./samllhydro.json', 'a', encoding='utf-8') as file:
    res.to_json(file, force_ascii=False, orient='records')