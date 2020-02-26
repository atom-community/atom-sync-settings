const DiffView = require('../lib/diff-view')

function elementsExist (view) {
	return {
		error: !!view.element.querySelector('.diff-view-error'),
		loading: !!view.element.querySelector('.diff-view-loading'),
		none: !!view.element.querySelector('.diff-view-none'),
		time: !!view.element.querySelector('.diff-view-time'),
		settings: !!view.element.querySelector('.diff-view-settings'),
		packages: !!view.element.querySelector('.diff-view-packages'),
		files: !!view.element.querySelector('.diff-view-files'),
	}
}

describe('DiffView', () => {
	let view
	beforeEach(() => {
		view = new DiffView()
	})

	it('should show loading', () => {
		expect(elementsExist(view)).toEqual({
			error: false,
			loading: true,
			none: false,
			time: false,
			settings: false,
			packages: false,
			files: false,
		})
	})

	it('should show none', async () => {
		await view.update({ diff: {}, error: null })
		expect(elementsExist(view)).toEqual({
			error: false,
			loading: false,
			none: true,
			time: false,
			settings: false,
			packages: false,
			files: false,
		})
	})

	it('should show time', async () => {
		await view.update({ diff: { localTime: 'time', backupTime: '' }, error: null })
		expect(elementsExist(view)).toEqual({
			error: false,
			loading: false,
			none: false,
			time: true,
			settings: false,
			packages: false,
			files: false,
		})
	})

	it('should show error', async () => {
		await view.update({ diff: null, error: 'test' })
		expect(elementsExist(view)).toEqual({
			error: true,
			loading: false,
			none: false,
			time: false,
			settings: false,
			packages: false,
			files: false,
		})
		const error = view.element.querySelector('.diff-view-error pre').textContent
		expect(error).toBe('test')
	})

	it('should show settings', async () => {
		await view.update({ diff: { settings: {}, localTime: '', backupTime: '' } })
		expect(elementsExist(view)).toEqual({
			error: false,
			loading: false,
			none: false,
			time: false,
			settings: true,
			packages: false,
			files: false,
		})
	})

	it('should show packages', async () => {
		await view.update({ diff: { packages: {}, localTime: '', backupTime: '' } })
		expect(elementsExist(view)).toEqual({
			error: false,
			loading: false,
			none: false,
			time: false,
			settings: false,
			packages: true,
			files: false,
		})
	})

	it('should show files', async () => {
		await view.update({ diff: { files: {}, localTime: '', backupTime: '' } })
		expect(elementsExist(view)).toEqual({
			error: false,
			loading: false,
			none: false,
			time: false,
			settings: false,
			packages: false,
			files: true,
		})
	})

	describe('refresh', () => {
		it('load diff', async () => {
			view.syncSettings = {
				gist: {
					get () {
						return {
							data: {
								history: [{
									committed_at: new Date().toISOString(),
								}],
								files: 'files',
							},
						}
					},
				},
				invalidRes: jasmine.createSpy('invalidRes').and.returnValue(false),
				getBackupData: jasmine.createSpy('getBackupData').and.returnValue({}),
				getLocalData: jasmine.createSpy('getLocalData').and.returnValue({}),
				getDiffData: jasmine.createSpy('getDiffData').and.returnValue({}),
			}
			atom.config.set('sync-settings.personalAccessToken', 'pat')
			atom.config.set('sync-settings.gistId', 'gid')
			spyOn(view, 'update')
			await view.refresh()
			expect(view.syncSettings.getBackupData).toHaveBeenCalled()
			expect(view.syncSettings.getLocalData).toHaveBeenCalled()
			expect(view.syncSettings.getDiffData).toHaveBeenCalled()
			expect(view.update).toHaveBeenCalledWith({ diff: null, error: null })
			expect(view.update).toHaveBeenCalledWith({
				diff: jasmine.objectContaining({
					localTime: jasmine.any(String),
					backupTime: jasmine.any(String),
				}),
				error: null,
			})
		})
	})

	describe('buttons', () => {
		let buttons
		beforeEach(() => {
			buttons = view.element.querySelector('.diff-view-buttons')
		})

		it('calls refresh', async () => {
			spyOn(view, 'refresh')
			await view.update({ diff: {} })
			buttons.querySelector('.refresh').click()
			expect(view.refresh).toHaveBeenCalled()
		})

		it('calls restore', async () => {
			view.syncSettings = {
				restore: jasmine.createSpy('restore'),
			}
			await view.update({ diff: {} })
			buttons.querySelector('.restore').click()
			expect(view.syncSettings.restore).toHaveBeenCalled()
		})

		it('calls backup', async () => {
			view.syncSettings = {
				backup: jasmine.createSpy('backup'),
			}
			await view.update({ diff: {} })
			buttons.querySelector('.backup').click()
			expect(view.syncSettings.backup).toHaveBeenCalled()
		})

		it('calls viewBackup', () => {
			view.syncSettings = {
				viewBackup: jasmine.createSpy('viewBackup'),
			}
			buttons.querySelector('.view-backup').click()
			expect(view.syncSettings.viewBackup).toHaveBeenCalled()
		})
	})
})
