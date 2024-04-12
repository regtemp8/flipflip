import fs from 'fs'
import path from 'path'
import jwt, { SignOptions } from 'jsonwebtoken'
import crypto, { randomInt, randomUUID } from 'crypto'
import selfsigned from 'selfsigned'
import { Request } from 'electron'
import { getSaveDir } from './utils'
import server from './FlipFlipServer'

interface ActiveJWTToken {
  sub: string
  timestamp: number
}

class SecurityService {
  private static readonly EXPIRES_IN = 5 * 60 * 1000
  private static readonly JWT_OPTIONS: SignOptions = {
    issuer: 'flipflip.org',
    audience: 'flipflip.org',
    algorithm: 'HS256',
    expiresIn: SecurityService.EXPIRES_IN
  }

  private static instance: SecurityService

  private jwtSecret: string
  private jwtTokens: ActiveJWTToken[]
  private activeCode: ActiveJWTToken | undefined

  private constructor() {
    this.jwtSecret = this.generateSecret()
    this.jwtTokens = []
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }

    return SecurityService.instance
  }

  public generateSecret(): string {
    return crypto.randomBytes(256).toString('base64')
  }

  public generateCode(): string {
    const sub = [...Array(8).keys()].map(() => randomInt(0, 10)).join('')
    const timestamp = new Date().getTime()
    this.activeCode = { sub, timestamp }
    return sub.substring(0, 4) + '-' + sub.substring(4)
  }

  public generateToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const sub = randomUUID()
      const timestamp = new Date().getTime()
      jwt.sign(
        { sub },
        this.jwtSecret,
        SecurityService.JWT_OPTIONS,
        (error, encoded) => {
          if (error) {
            reject(error)
          } else {
            this.removeExpiredTokens(timestamp)
            this.jwtTokens.push({ sub, timestamp })
            resolve(encoded)
          }
        }
      )
    })
  }

  public magicLink(url: string, token: string): Promise<string> {
    return Promise.resolve(`${url}/login/token?token=${token}`)
  }

  public generateMagicLink(url: string): Promise<string> {
    return security()
      .generateToken()
      .then((token) => this.magicLink(url, token))
  }

  public deactivateCode() {
    this.activeCode = undefined
  }

  public verifyCode(code: string): boolean {
    const valid =
      this.activeCode != null &&
      this.activeCode.timestamp + SecurityService.EXPIRES_IN >
        new Date().getTime() &&
      this.activeCode.sub === code

    this.activeCode = undefined
    return valid
  }

  public verifyToken(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      jwt.verify(
        token,
        this.jwtSecret,
        SecurityService.JWT_OPTIONS,
        (error, decoded) => {
          if (error) {
            resolve(false)
          } else {
            this.removeExpiredTokens(new Date().getTime())
            const sub = decoded.sub
            const index = this.jwtTokens.findIndex((t) => t.sub === sub)
            const valid = index !== -1
            if (valid) {
              this.jwtTokens.splice(index, 1)
            }
            resolve(valid)
          }
        }
      )
    })
  }

  private removeExpiredTokens(timestamp: number) {
    this.jwtTokens = this.jwtTokens.filter(
      (t) => t.timestamp + SecurityService.EXPIRES_IN > timestamp
    )
  }

  private getPrivateKeyPath(): string {
    return path.join(getSaveDir(), 'server.key')
  }

  private getCertificatePath(): string {
    return path.join(getSaveDir(), 'server.crt')
  }

  public readPrivateKey(): string {
    return fs.readFileSync(this.getPrivateKeyPath(), 'utf8')
  }

  public readCertificate(): string {
    return fs.readFileSync(this.getCertificatePath(), 'utf8')
  }

  public generateCertificates() {
    const privateKeyPath = this.getPrivateKeyPath()
    const certificatePath = this.getCertificatePath()
    let generateCertificate =
      !fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath)
    if (!generateCertificate) {
      const certificate = new crypto.X509Certificate(this.readCertificate())
      const validTo = new Date(certificate.validTo)
      generateCertificate = new Date().getTime() > validTo.getTime()
    }
    if (generateCertificate) {
      const attrs = [
        { name: 'commonName', value: 'flipflip.org' },
        { name: 'organizationName', value: 'flipflip' }
      ]
      const opts = {
        keySize: 2048,
        algorithm: 'sha256',
        days: 90
      }
      const pems = selfsigned.generate(attrs, opts)
      fs.writeFileSync(privateKeyPath, pems.private, 'utf-8')
      fs.writeFileSync(certificatePath, pems.cert, 'utf-8')
    }
  }

  public verifyCertificate(request: Request): number {
    let valid = false
    if (request.verificationResult !== 'OK') {
      const hostname = request.hostname
      const serverHostName = new URL(server().getServerURL()).hostname
      if (hostname === serverHostName) {
        const data = this.sanitizeCertificate(request.validatedCertificate.data)
        const localData = this.sanitizeCertificate(this.readCertificate())
        valid = data === localData
      }
    }

    const verified = 0
    const useChromiumVerificationResult = -3
    return valid === true ? verified : useChromiumVerificationResult
  }

  private sanitizeCertificate(certificate: string): string {
    return certificate.replace(/[\n\r]/g, '').trim()
  }
}

export default function security(): SecurityService {
  return SecurityService.getInstance()
}
