#!/usr/bin/env node

/**
 * Step 3.4 Real-time Subscriptions Validation Script
 * Validates all real-time implementation components
 * Based on KickHub Build Guide Step 3.4 specifications (Lines 5627-5663)
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Step 3.4 Real-time Subscriptions Validation')
console.log('=============================================\n')

class RealtimeValidator {
  constructor() {
    this.results = []
    this.passedTests = 0
    this.failedTests = 0
  }

  /**
   * Add validation result
   */
  addResult(test, status, message, details = null) {
    this.results.push({ test, status, message, details })
    if (status === 'passed') this.passedTests++
    else this.failedTests++
  }

  /**
   * Validate real-time infrastructure files exist
   */
  async validateRealtimeInfrastructure() {
    console.log('📁 Validating Real-time Infrastructure...')

    const requiredFiles = [
      'src/lib/realtime/RealtimeManager.ts',
      'src/lib/realtime/OfflineStateManager.ts',
      'src/hooks/useRealtime.ts',
      'src/hooks/useOfflineState.ts'
    ]

    for (const filePath of requiredFiles) {
      if (fs.existsSync(filePath)) {
        this.addResult(
          `File exists: ${filePath}`,
          'passed',
          'Required real-time file exists'
        )
      } else {
        this.addResult(
          `File missing: ${filePath}`,
          'failed',
          'Critical real-time file is missing'
        )
      }
    }
  }

  /**
   * Validate database migration for real-time
   */
  async validateDatabaseSetup() {
    console.log('💾 Validating Database Real-time Setup...')

    const migrationPath = 'supabase/migrations/20240101000022_enable_realtime_subscriptions.sql'
    
    if (fs.existsSync(migrationPath)) {
      const migrationContent = fs.readFileSync(migrationPath, 'utf8')
      
      // Check for required ALTER PUBLICATION statements
      const requiredTables = [
        'matches', 'match_statistics', 'notifications', 
        'messages', 'training_sessions', 'user_roles', 'team_announcements'
      ]

      let tablesEnabled = 0
      for (const table of requiredTables) {
        if (migrationContent.includes(`ADD TABLE ${table}`)) {
          tablesEnabled++
        }
      }

      if (tablesEnabled === requiredTables.length) {
        this.addResult(
          'Real-time Publication Setup',
          'passed',
          `All ${requiredTables.length} critical tables enabled for real-time`
        )
      } else {
        this.addResult(
          'Real-time Publication Setup',
          'failed',
          `Only ${tablesEnabled}/${requiredTables.length} tables enabled for real-time`
        )
      }

      // Check for performance indexes
      const requiredIndexes = [
        'idx_matches_realtime',
        'idx_notifications_realtime', 
        'idx_messages_realtime',
        'idx_match_statistics_realtime'
      ]

      let indexesCreated = 0
      for (const index of requiredIndexes) {
        if (migrationContent.includes(index)) {
          indexesCreated++
        }
      }

      if (indexesCreated >= 3) {
        this.addResult(
          'Performance Indexes',
          'passed',
          `${indexesCreated}/${requiredIndexes.length} performance indexes created`
        )
      } else {
        this.addResult(
          'Performance Indexes',
          'failed',
          `Only ${indexesCreated}/${requiredIndexes.length} performance indexes found`
        )
      }
    } else {
      this.addResult(
        'Database Migration',
        'failed',
        'Real-time migration file does not exist'
      )
    }
  }

  /**
   * Validate configuration files
   */
  async validateConfiguration() {
    console.log('⚙️ Validating Configuration...')

    // Check kickhub.config.json
    const configPath = '../kickhub.config.json'
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        
        if (config.realtime && config.realtime.enabled) {
          this.addResult(
            'Config: Real-time Enabled',
            'passed',
            'Real-time configuration found and enabled'
          )

          // Check required tables configuration
          const configTables = Object.keys(config.realtime.tables || {})
          if (configTables.length >= 5) {
            this.addResult(
              'Config: Tables Configuration',
              'passed',
              `${configTables.length} real-time tables configured`
            )
          } else {
            this.addResult(
              'Config: Tables Configuration',
              'failed',
              `Only ${configTables.length} tables configured, expected at least 5`
            )
          }

          // Check features configuration
          if (config.realtime.features && config.realtime.features.presence_tracking) {
            this.addResult(
              'Config: Features',
              'passed',
              'Real-time features properly configured'
            )
          } else {
            this.addResult(
              'Config: Features',
              'failed',
              'Real-time features not properly configured'
            )
          }
        } else {
          this.addResult(
            'Config: Real-time',
            'failed',
            'Real-time not enabled in configuration'
          )
        }
      } catch (error) {
        this.addResult(
          'Config: Parse Error',
          'failed',
          `Failed to parse configuration file: ${error.message}`
        )
      }
    } else {
      this.addResult(
        'Config: File Missing',
        'failed',
        'Configuration file does not exist'
      )
    }

    // Check feature flags
    const flagsPath = 'src/config/feature-flags.ts'
    if (fs.existsSync(flagsPath)) {
      const flagsContent = fs.readFileSync(flagsPath, 'utf8')
      
      if (flagsContent.includes('REALTIME_FLAGS') && flagsContent.includes('REALTIME_ENABLED')) {
        this.addResult(
          'Feature Flags: Real-time',
          'passed',
          'Real-time feature flags properly configured'
        )
      } else {
        this.addResult(
          'Feature Flags: Real-time',
          'failed',
          'Real-time feature flags missing or incomplete'
        )
      }
    }
  }

  /**
   * Validate React hooks implementation
   */
  async validateReactHooks() {
    console.log('⚛️ Validating React Hooks...')

    const hooksPath = 'src/hooks/useRealtime.ts'
    if (fs.existsSync(hooksPath)) {
      const hooksContent = fs.readFileSync(hooksPath, 'utf8')
      
      // Check for required hooks
      const requiredHooks = [
        'useRealtime',
        'useMatchUpdates',
        'useTeamNotifications',
        'useTeamMessages',
        'useMatchPresence'
      ]

      let hooksFound = 0
      for (const hook of requiredHooks) {
        if (hooksContent.includes(`export function ${hook}`)) {
          hooksFound++
        }
      }

      if (hooksFound === requiredHooks.length) {
        this.addResult(
          'React Hooks: Implementation',
          'passed',
          `All ${requiredHooks.length} required hooks implemented`
        )
      } else {
        this.addResult(
          'React Hooks: Implementation',
          'failed',
          `Only ${hooksFound}/${requiredHooks.length} hooks found`
        )
      }

      // Check for proper imports
      if (hooksContent.includes("from '@/lib/realtime/RealtimeManager'")) {
        this.addResult(
          'React Hooks: Imports',
          'passed',
          'Proper imports for RealtimeManager found'
        )
      } else {
        this.addResult(
          'React Hooks: Imports',
          'failed',
          'Missing or incorrect imports for RealtimeManager'
        )
      }
    }
  }

  /**
   * Validate TypeScript compilation
   */
  async validateTypeScriptCompilation() {
    console.log('🔧 Validating TypeScript Compilation...')

    try {
      const { execSync } = require('child_process')
      execSync('npx tsc --noEmit --skipLibCheck', { cwd: process.cwd() })
      
      this.addResult(
        'TypeScript Compilation',
        'passed',
        'All TypeScript files compile successfully'
      )
    } catch (error) {
      this.addResult(
        'TypeScript Compilation',
        'failed',
        `TypeScript compilation failed: ${error.message}`
      )
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 Validation Results Summary')
    console.log('==============================')
    
    this.results.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : '❌'
      console.log(`${icon} ${result.test}: ${result.message}`)
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details)}`)
      }
    })

    console.log(`\n📈 Results: ${this.passedTests} passed, ${this.failedTests} failed`)
    
    const completionPercentage = Math.round((this.passedTests / (this.passedTests + this.failedTests)) * 100)
    console.log(`🎯 Step 3.4 Completion: ${completionPercentage}%`)

    if (completionPercentage >= 90) {
      console.log('🎉 Step 3.4 Real-time Subscriptions: READY FOR PRODUCTION')
    } else if (completionPercentage >= 70) {
      console.log('⚠️  Step 3.4 Real-time Subscriptions: DEVELOPMENT READY (needs fixes)')
    } else {
      console.log('🚨 Step 3.4 Real-time Subscriptions: NOT READY (critical issues)')
    }

    return completionPercentage >= 90
  }

  /**
   * Run all validations
   */
  async validateAll() {
    try {
      await this.validateRealtimeInfrastructure()
      await this.validateDatabaseSetup()
      await this.validateConfiguration()
      await this.validateReactHooks()
      await this.validateTypeScriptCompilation()
      
      return this.generateReport()
    } catch (error) {
      console.error('❌ Validation failed with error:', error)
      return false
    }
  }
}

// Execute validation if run directly
if (require.main === module) {
  const validator = new RealtimeValidator()
  validator.validateAll().then(success => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = RealtimeValidator

