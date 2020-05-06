import {StorageAccessService} from "../../storage/StorageAccessService.js";

export class ApiRequestService
{
	private _onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null = null;
	private _method: ApiRequestMethodEnum = ApiRequestMethodEnum.GET;
	private _async: boolean = true;
	private _params: Array<ApiParameter> = [];


	public get onreadystatechange(): ((this: XMLHttpRequest, ev: Event) => any) | null
	{
		return this._onreadystatechange;
	}

	public set onreadystatechange(value: ((this: XMLHttpRequest, ev: Event) => any) | null)
	{
		this._onreadystatechange = value;
	}

	public get method(): ApiRequestMethodEnum
	{
		return this._method;
	}

	public set method(value: ApiRequestMethodEnum)
	{
		this._method = value;
	}

	public get is_async(): boolean
	{
		return this._async;
	}

	public set is_async(async: boolean)
	{
		this._async = async;
	}

	public add_param(key: string, value?: string): void
	{
		if (!value)
		{
			value = null;
		}
		this._params.push({[key]: value})
	}

	public async send(): Promise<void>
	{
		const httpResponse = new XMLHttpRequest();    //Make a new object to accept return from server
		const url_base = (await StorageAccessService.get_pi_hole_settings()).pi_uri_base;
		const api_key = (await StorageAccessService.get_pi_hole_settings()).api_key;

		if (!url_base || !api_key)
		{
			console.log("Settings haven't been set. Cancled API Request")
			return;
		}

		let url: string = url_base + "/api.php?auth=" + api_key;

		for (let i = 0; i < this._params.length; i++)
		{
			const params: ApiParameter = this._params[i];
			if (params)
			{
				const key: string = Object.keys(params)[0];
				const value: string = Object.keys(params).map(key => params[key])[0];


				url += "&" + key + (value ? '=' + value : '');
			}
		}

		if (this.onreadystatechange)
		{
			httpResponse.onreadystatechange = this.onreadystatechange;
		}

		httpResponse.open(this.method, url, this.is_async);
		httpResponse.send();
	}
}

interface ApiParameter
{
	[key: string]: string;
}

export enum ApiRequestMethodEnum
{
	GET = 'Get',
	POST = 'Post'
}