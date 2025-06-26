import crypto from 'crypto'
import https from 'https'
import Server, { createProxyServer } from 'http-proxy'
import { Request, Response } from 'express'
import logger from '../logger'

export interface ProxyRequest {
  url: string
  headers?: Record<string, string>
}

class ProxyService {
  private static instance: ProxyService

  private readonly server: Server
  private readonly registry: Map<string, ProxyRequest>

  private constructor() {
    this.server = createProxyServer({})
    this.server.on('proxyRes', (proxyRes, req, res) => {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*')
      if (proxyRes.statusCode != null && proxyRes.statusCode !== 200) {
        res.statusCode = proxyRes.statusCode
        res.statusMessage = proxyRes.statusMessage ?? ''
        if (proxyRes.statusCode === 416) {
          const value = proxyRes.headers['content-range']
          if (value != null) {
            res.setHeader('content-range', value)
          }
        }

        res.end()
        return
      }

      const headers = ['accept-ranges', 'content-type', 'date']
      if (req.headers.range) {
        headers.push('content-range')
      }

      headers.forEach((key) => {
        const value = proxyRes.headers[key]
        if (value != null) {
          res.setHeader(key, value)
        }
      })

      proxyRes.pipe(res)
    })
    this.registry = new Map<string, ProxyRequest>()
  }

  public static getInstance(): ProxyService {
    if (ProxyService.instance == null) {
      ProxyService.instance = new ProxyService()
    }

    return ProxyService.instance
  }

  public get(uuid: string, req: Request, res: Response): void {
    const request = this.registry.get(uuid)
    if (request != null) {
      const { url, headers } = request
      req.url = url
      const { origin } = new URL(url)
      const options: Server.ServerOptions = {
        headers,
        target: origin,
        changeOrigin: true,
        followRedirects: true,
        proxyTimeout: 5000,
        selfHandleResponse: true
      }
      this.server.web(req, res, options, (error, req, res) => {
        logger.error(`Failed to proxy request ${url}`, { error })
        ;(res as Response).status(500).end()
      })
    }
  }

  public set(request: ProxyRequest, ext?: string): string {
    const { url } = request
    if (ext == null) {
      const { pathname } = new URL(url)
      ext = pathname.substring(pathname.lastIndexOf('.'))
    }

    const hash = crypto.createHash('sha256').update(url).digest('hex')
    const alias = hash + ext
    if (!this.registry.has(alias)) {
      this.registry.set(alias, request)
    }

    return alias
  }

  public nimja(req: Request, res: Response) {
    const baseURL = 'https://hypno.nimja.com'
    const url = req.originalUrl.replace('/proxy/nimja', baseURL)
    https
      .get(url, (response) => {
        const data: Uint8Array[] = []
        response.on('data', (chunk) => {
          data.push(chunk)
        })

        response.on('end', () => {
          let html = Buffer.concat(data).toString()
          html = html.replace('<head>', `<head><base href="${baseURL}/">`)
          html = html.replace(
            '<link rel="manifest" href="/site.webmanifest">',
            ''
          )
          res
            .appendHeader('Content-Type', 'text/html')
            .status(200)
            .send(html)
            .end()
        })
      })
      .on('error', (error) => {
        res.statusMessage = `${error.name} - ${error.message}`
        res.status(503).end()
      })
  }
}

export default function proxy() {
  return ProxyService.getInstance()
}
